/**
 * useAuthHook.ts
 * 
 * Hook personalizzato che gestisce l'autenticazione dell'utente.
 * Fornisce lo stato e le funzioni per login, logout, gestione dei token di accesso e refresh,
 * e un metodo per effettuare richieste autenticati gestendo automaticamente il refresh del token.
 */

"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { getItem, setItem, removeItem } from "../lib/indexedDB";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useAuthHook() {
  // Stato e riferimenti per token di accesso, nome utente e caricamento
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  // Chiavi per salvataggio in IndexedDB
  const REFRESH_TOKEN_KEY = "refreshToken";
  const USERNAME_KEY = "username";
  const ACCESS_TOKEN_KEY = "accessToken";

  // Riferimenti per controllare stato del refresh e logout
  const triedRefresh = useRef(false);
  const refreshInProgress = useRef(false);
  const logoutStartedRef = useRef(false);

  let refreshPromise: Promise<string> | null = null;

  /**
   * Aggiorna lo stato e il riferimento del token di accesso.
   */
  const updateAccessToken = (token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  };

  /**
   * Mostra un toast di errore con un messaggio personalizzato o di default.
   */
  const showToastError = (message?: string) => {
    toast.error(message || "Errore imprevisto, riprova più tardi");
  };

  /**
   * Effettua l'inizializzazione dello stato autenticazione recuperando i dati salvati.
   * Se i dati non sono disponibili o sono invalidi, imposta lo stato come non autenticato.
   */
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const savedUsername = (await getItem(USERNAME_KEY)) as string | null;
        const savedAccessToken = (await getItem(ACCESS_TOKEN_KEY)) as string | null;
        const savedRefreshToken = (await getItem(REFRESH_TOKEN_KEY)) as string | null;

        if (!savedUsername || !savedRefreshToken) {
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

  /**
   * Esegue la richiesta per rinnovare il token di accesso usando il refresh token.
   * Gestisce il salvataggio dei nuovi token e aggiorna lo stato.
   * Ritorna il nuovo token di accesso.
   */
  async function refreshAccessToken(refreshToken: string, username: string): Promise<string> {
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
          await logoutOnce();
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

  /**
   * Esegue il login con username e password.
   * Salva i token e lo username in IndexedDB e aggiorna lo stato.
   * Mostra messaggi di errore in caso di credenziali errate o errori imprevisti.
   */
  const login = useCallback(async (usernameInput: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      let data: any = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const userMessage = "Credenziali errate";
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

  /**
   * Esegue il logout: revoca il token sul server, cancella i dati localmente,
   * aggiorna lo stato e reindirizza alla home.
   */
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
    } finally {
      logoutStartedRef.current = false;
      setLoading(false);
    }
  }, [router]);

  /**
   * Esegue il logout solo una volta per evitare chiamate multiple.
   * Mostra un messaggio di sessione scaduta e chiama logout.
   */
  const logoutOnce = useCallback(async () => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;

    toast.warning("Sessione scaduta, effettua nuovamente il login");
    await logout();
  }, [logout]);

  /**
   * Wrapper per fetch che aggiunge il token di accesso alle richieste.
   * In caso di errore 401, prova a rinnovare il token e ripetere la richiesta.
   * Se il refresh fallisce, esegue il logout.
   */
  async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = accessTokenRef.current;
    const headers = new Headers(init?.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(input, { ...init, headers });

    if (response.status !== 401) return response;

    try {
      const refreshToken = (await getItem(REFRESH_TOKEN_KEY)) as string | null;
      const currentUsername = username ?? ((await getItem(USERNAME_KEY)) as string | null);

      if (!refreshToken || !currentUsername) {
        throw new Error("Refresh token o username non disponibile");
      }

      const newAccessToken = await refreshAccessToken(refreshToken, currentUsername);

      headers.set("Authorization", `Bearer ${newAccessToken}`);
      response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        await logoutOnce();
      }

      return response;
    } catch (err) {
      await logoutOnce();
      throw new Error("[fetchWithAuth] Errore durante refresh token");
    }
  }

  // Esportazione dei dati e delle funzioni principali dello hook
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
