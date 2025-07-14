"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { getItem, setItem, removeItem } from "../lib/indexedDB";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useAuthHook() {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  const REFRESH_TOKEN_KEY = "refreshToken";
  const USERNAME_KEY = "username";
  const ACCESS_TOKEN_KEY = "accessToken";

  const triedRefresh = useRef(false);
  const refreshInProgress = useRef(false);

  let refreshPromise: Promise<string> | null = null;

  // Funzione per aggiornare accessToken sia in stato che in ref
  const updateAccessToken = (token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  };

  // Funzione helper per mostrare messaggi toast user-friendly
  const showToastError = (message?: string) => {
    toast.error(message || "Errore imprevisto, riprova più tardi");
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const savedUsername = (await getItem(USERNAME_KEY)) as string | null;
        const savedAccessToken = (await getItem(ACCESS_TOKEN_KEY)) as
          | string
          | null;
        const savedRefreshToken = (await getItem(REFRESH_TOKEN_KEY)) as
          | string
          | null;

        if (!savedUsername || !savedRefreshToken) {
          // Se manca username o refresh token, siamo logout
          setUsername(null);
          updateAccessToken(null);
          triedRefresh.current = true;
          setLoading(false);
          return;
        }

        setUsername(savedUsername);
        updateAccessToken(savedAccessToken);
        triedRefresh.current = true;
      } catch (error) {
        console.error("[init] Errore init auth:", error);
        showToastError();
        await logout();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function refreshAccessToken(
    refreshToken: string,
    username: string
  ): Promise<string> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      refreshInProgress.current = true;

      try {
        const res = await fetch(`/api/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, refreshToken }),
        });

        if (!res.ok) {
          toast.warning("Sessione scaduta, effettua nuovamente il login");
          await logout();
          throw new Error("Refresh token scaduto");
        }

        const data = await res.json();

        if (data.refreshToken) {
          await setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        updateAccessToken(data.accessToken);
        await setItem(ACCESS_TOKEN_KEY, data.accessToken);

        return data.accessToken;
      } finally {
        refreshInProgress.current = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  const login = useCallback(async (usernameInput: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      let data: any = null;
      // Provo a leggere il json solo se c'è un body
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null; // non è JSON valido
      }

      if (!res.ok) {
        // Messaggio utente basato su risposta o fallback
        const userMessage ="Credenziali errate"
        toast.error(userMessage);
        throw new Error(userMessage);
      }

      setUsername(usernameInput);
      updateAccessToken(data.accessToken);

      await setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      await setItem(USERNAME_KEY, usernameInput);
      await setItem(ACCESS_TOKEN_KEY, data.accessToken);

      triedRefresh.current = true;
    } catch (error) {
      if (!(error instanceof Error)) {
        toast.error("Errore imprevisto, riprova più tardi");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const token = accessTokenRef.current;

      if (token) {
        const response = await fetch("/api/revoke", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn(`[logout] Revoke failed with status ${response.status}`);
        }
      }

      updateAccessToken(null);
      setUsername(null);

      await removeItem(REFRESH_TOKEN_KEY);
      await removeItem(USERNAME_KEY);
      await removeItem(ACCESS_TOKEN_KEY);

      triedRefresh.current = false;

      router.push("/");
    } catch (error) {
      console.warn("[logout] Errore durante revoke:", error);
      // Non mostriamo errore toast all'utente, ma possiamo loggare
    } finally {
      setLoading(false);
    }
  }, [router]);

  async function fetchWithAuth(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    const token = accessTokenRef.current;
    const headers = new Headers(init?.headers || {});

    headers.set("Authorization", `Bearer ${token}`);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json"); // fallback
    }

    let response = await fetch(input, { ...init, headers });

    if (response.status !== 401) return response;

    // Tentativo di refresh
    try {
      const refreshToken = (await getItem(REFRESH_TOKEN_KEY)) as string | null;
      const currentUsername =
        username ?? ((await getItem(USERNAME_KEY)) as string | null);

      if (!refreshToken || !currentUsername) {
        throw new Error("Refresh token o username non disponibile");
      }

      const newAccessToken = await refreshAccessToken(
        refreshToken,
        currentUsername
      );

      headers.set("Authorization", `Bearer ${newAccessToken}`);

      response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        toast.warning("Sessione scaduta, effettua nuovamente il login");
        await logout();
      }

      return response;
    } catch (err) {
      toast.warning("Sessione scaduta, effettua nuovamente il login");
      await logout();
      throw new Error("[fetchWithAuth] Errore durante refresh token");
    }
  }

  return {
    accessToken,
    username,
    login,
    logout,
    loading,
    refreshAccessToken,
    setAccessToken: updateAccessToken,
    fetchWithAuth,
    isReady: !loading,
  };
}
