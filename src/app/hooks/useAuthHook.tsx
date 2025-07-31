/**
 * useAuthHook.ts
 *
 * Questo hook personalizzato gestisce l'autenticazione lato client in un'app Next.js.
 * Fornisce funzionalità di login, logout, refresh del token di accesso,
 * gestione dello stato di autenticazione e integrazione con IndexedDB per la persistenza.
 * È pensato per essere usato in tutta l'app come sistema centralizzato di auth.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getItem, setItem, removeItem } from "../lib/indexedDB";

// Chiavi di salvataggio in IndexedDB
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_KEY = "accessToken";
const USERNAME_KEY = "username";

// Funzione per mostrare toast di errore e loggare l'errore
const handleError = (error: unknown, fallbackMessage = "Errore imprevisto") => {
  console.error(error);
  toast.error(fallbackMessage);
};

export function useAuthHook() {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Riferimenti interni per evitare chiamate multiple o cicli infiniti
  const logoutStartedRef = useRef(false);
  const refreshInProgress = useRef(false);
  const triedRefresh = useRef(false);
  let refreshPromise: Promise<string> | null = null;

  // Sincronizza accessToken nello state e nel ref
  const updateAccessToken = (token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  };

  /**
   * Inizializza i dati auth da IndexedDB al primo mount del componente.
   */
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const [storedUsername, storedAccessToken, storedRefreshToken] =
          await Promise.all([
            getItem(USERNAME_KEY),
            getItem(ACCESS_TOKEN_KEY),
            getItem(REFRESH_TOKEN_KEY),
          ]);

        if (!storedUsername || !storedRefreshToken) {
          updateAccessToken(null);
          setUsername(null);
        } else {
          updateAccessToken(storedAccessToken as string | null);
          setUsername(storedUsername as string);
        }

        triedRefresh.current = true;
      } catch (err) {
        handleError(err);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Effettua login utente, salva token/accesso in IndexedDB e aggiorna lo stato.
   */
  const login = useCallback(
    async (usernameInput: string, password: string): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameInput, password }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok || !data) {
          toast.error("Credenziali errate");
          throw new Error("Login failed");
        }

        await Promise.all([
          setItem(REFRESH_TOKEN_KEY, data.refreshToken),
          setItem(ACCESS_TOKEN_KEY, data.accessToken),
          setItem(USERNAME_KEY, usernameInput),
        ]);

        setUsername(usernameInput);
        updateAccessToken(data.accessToken);
        triedRefresh.current = true;
      } catch (err) {
        handleError(err, "Errore durante il login");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Logout completo: rimuove dati da IndexedDB, resetta lo stato e redirige.
   */
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
        }).catch((e) => console.warn("[logout] Errore durante revoke:", e));
      }

      await Promise.all([
        removeItem(REFRESH_TOKEN_KEY),
        removeItem(ACCESS_TOKEN_KEY),
        removeItem(USERNAME_KEY),
      ]);

      updateAccessToken(null);
      setUsername(null);
      triedRefresh.current = false;

      router.push("/");
    } finally {
      logoutStartedRef.current = false;
      setLoading(false);
    }
  }, [router]);

  /**
   * Logout che si attiva una sola volta (es. se riceviamo un 401 multiplo).
   */
  const logoutOnce = useCallback(async () => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;
    toast.warning("Sessione scaduta, effettua nuovamente il login");
    await logout();
  }, [logout]);

  /**
   * Richiede un nuovo accessToken a partire dal refreshToken.
   * Salva eventuali nuovi token in IndexedDB e aggiorna lo stato.
   */
  const refreshAccessToken = async (
    refreshToken: string,
    username: string
  ): Promise<string> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      refreshInProgress.current = true;

      try {
        const res = await fetch("/api/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, refreshToken }),
        });

        if (!res.ok) {
          await logout();
          throw new Error("Refresh token scaduto");
        }

        const data = await res.json();

        if (!data.accessToken) {
          throw new Error("Access token mancante nella risposta");
        }

        await Promise.all([
          setItem(ACCESS_TOKEN_KEY, data.accessToken),
          data.refreshToken && setItem(REFRESH_TOKEN_KEY, data.refreshToken),
        ]);

        updateAccessToken(data.accessToken);
        return data.accessToken;
      } finally {
        refreshInProgress.current = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  /**
   * Retry automatico di una richiesta che ha restituito 401, dopo tentato refresh del token.
   */
  const handle401Retry = async (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    try {
      const refreshToken = (await getItem(REFRESH_TOKEN_KEY)) as string | null;
      const currentUsername =
        username ?? ((await getItem(USERNAME_KEY)) as string | null);

      if (!refreshToken || !currentUsername) {
        throw new Error("Refresh token o username non disponibile");
      }

      await refreshAccessToken(refreshToken, currentUsername);

      const newAccessToken = (await getItem(ACCESS_TOKEN_KEY)) as string | null;
      if (!newAccessToken)
        throw new Error("Access token mancante dopo refresh");

      const retryHeaders = new Headers(init?.headers || {});
      retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
      if (!retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryResponse = await fetch(input, {
        ...init,
        headers: retryHeaders,
      });

      if (retryResponse.status === 401) {
        await logoutOnce();
      }

      return retryResponse;
    } catch {
      await logoutOnce();
      throw new Error("[handle401Retry] Errore durante refresh e retry");
    }
  };

  /**
   * Wrapper per fetch con autorizzazione.
   * Gestisce automaticamente il token e fa retry in caso di 401.
   */
  const fetchWithAuth = async (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    if (loading || !triedRefresh.current) {
      // Aspetta caricamento iniziale auth
      await new Promise((resolve) => {
        const check = () => {
          if (!loading && triedRefresh.current) return resolve(null);
          setTimeout(check, 50);
        };
        check();
      });
    }

    let token = accessTokenRef.current;

    // Recupera token da IndexedDB se non presente
    if (!token) {
      token = (await getItem(ACCESS_TOKEN_KEY)) as string | null;
      if (token) updateAccessToken(token);
    }

    const headers = new Headers(init?.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, { ...init, headers });

    return response.status === 401
      ? await handle401Retry(input, init)
      : response;
  };

  return {
    accessToken,
    username,
    login,
    logout,
    loading,
    refreshAccessToken,
    fetchWithAuth,
    setAccessToken: updateAccessToken,
    isReady: !loading,
  };
}
