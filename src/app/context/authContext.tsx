
"use client";

import { createContext, useContext } from "react";
import { useAuthHook as useAuthHook } from "../hooks/useAuthHook";

const AuthContext = createContext<ReturnType<typeof useAuthHook> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di <AuthProvider>");
  }
  return context;
};
