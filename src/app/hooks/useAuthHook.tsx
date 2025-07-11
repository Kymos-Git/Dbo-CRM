"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { getItem, setItem, removeItem } from "../lib/indexedDB";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    async function init() {
      console.log("[init] start");
      setLoading(true);
      try {
        const savedUsername = (await getItem(USERNAME_KEY)) as string | null;
        const savedAccessToken = (await getItem(ACCESS_TOKEN_KEY)) as
          | string
          | null;
        const savedRefreshToken = (await getItem(REFRESH_TOKEN_KEY)) as
          | string
          | null;

        console.log("dati:", {
          savedUsername,
          savedAccessToken,
          savedRefreshToken,
        });

        if (!savedUsername || !savedRefreshToken) {
          // Se manca username o refresh token, siamo logout
          setUsername(null);
          updateAccessToken(null);
          triedRefresh.current = true;
          setLoading(false);
          return;
        }

        setUsername(savedUsername);
        console.log("username:", savedUsername);
        console.log("token pre save", savedAccessToken);
        updateAccessToken(savedAccessToken);
        console.log("token", accessToken);
        triedRefresh.current = true;
      } catch (error) {
        console.error("[init] Errore init auth:", error);
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Errore nel login");
      }

      setUsername(usernameInput);
      updateAccessToken(data.accessToken);

      await setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      await setItem(USERNAME_KEY, usernameInput);
      await setItem(ACCESS_TOKEN_KEY, data.accessToken);

      triedRefresh.current = true;

      // Se vuoi, fai redirect o altre azioni qui
      // router.push("/dashboard");  // esempio redirect dopo login
    } catch (error) {
      console.error("[login] errore:", error);
      throw error; // rilancia per gestione errore esterna
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const token = accessTokenRef.current;

      if (token) {
        await fetch("/api/revoke", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.warn("[logout] Errore durante revoke:", err);
          // Ignora errori di revoca per continuare il logout
        });
      }

      updateAccessToken(null);
      setUsername(null);

      await removeItem("refreshToken");
      await removeItem("username");
      await removeItem("accessToken");

      triedRefresh.current = false;

      router.push("/");
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
      console.log("[fetchWithAuth] token scaduto, provo refresh...");
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

      // Aggiorna header
      headers.set("Authorization", `Bearer ${newAccessToken}`);

      response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        await logout();
        throw new Error("Sessione scaduta, effettua il login");
      }

      return response;
    } catch (err) {
      console.error("[fetchWithAuth] errore durante refresh token:", err);
      await logout();
      throw new Error("Sessione scaduta, effettua il login");
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
