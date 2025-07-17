"use client";

import React, { createContext, useState, useContext } from "react";

/**
 * RouteLoadingContext
 * 
 * Contesto React creato per gestire lo stato di caricamento delle rotte
 * all'interno dell'applicazione, fornendo una variabile booleana `loading`
 * e una funzione `setLoading` per modificarla.
 */
type RouteLoadingContextType = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextType>({
  loading: false,
  setLoading: () => {},
});

/**
 * RouteLoadingProvider
 * 
 * Componente provider che mantiene lo stato di caricamento `loading` tramite useState
 * e lo rende disponibile a tutti i componenti figli tramite il contesto RouteLoadingContext.
 */
export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  return (
    <RouteLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </RouteLoadingContext.Provider>
  );
};

/**
 * useRouteLoading
 * 
 * Hook custom che permette ai componenti figli di accedere facilmente
 * allo stato e alla funzione di modifica del caricamento delle rotte.
 */
export const useRouteLoading = () => useContext(RouteLoadingContext);
