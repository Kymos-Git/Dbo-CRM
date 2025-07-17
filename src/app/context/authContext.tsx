"use client";

import { createContext, useContext } from "react";
import { useAuthHook as useAuthHook } from "../hooks/useAuthHook";

/**
 * AuthContext
 * 
 * Contesto React creato per fornire lo stato e le funzioni di autenticazione
 * a tutta l'applicazione tramite il provider AuthProvider.
 */
const AuthContext = createContext<ReturnType<typeof useAuthHook> | null>(null);

/**
 * AuthProvider
 * 
 * Componente provider che avvolge i figli dell'applicazione,
 * inizializza il hook personalizzato useAuthHook e fornisce il suo valore
 * tramite il contesto AuthContext a tutti i componenti figli.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth
 * 
 * Hook custom che consente di accedere al contesto di autenticazione
 * all'interno dei componenti figli. Lancia un errore se usato al di fuori
 * del provider AuthProvider per garantire il corretto utilizzo.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di <AuthProvider>");
  }
  return context;
};
