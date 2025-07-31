/**
 * RouteLoader.tsx
 * 
 * Wrapper componente che gestisce lo stato di caricamento durante i cambi di route in Next.js.
 * Utilizza un context personalizzato (useRouteLoading) per tracciare se una navigazione è in corso.
 * Mostra un componente di caricamento fintanto che lo stato "loading" è true.
 * Quando la route cambia, disattiva automaticamente il loader.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouteLoading } from "@/app/context/routeContext";
import { LoadingComponent } from "./loading/loading";

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  // Estrae dallo useRouteLoading il valore booleano "loading" e la funzione per aggiornarlo
  const { loading, setLoading } = useRouteLoading();

  // Ottiene il pathname corrente dalla navigazione Next.js
  const pathname = usePathname();

  /**
   * Effetto che si attiva al cambio del pathname.
   * Serve a disattivare lo stato di caricamento al completamento della navigazione.
   * 
   * Dipendenze:
   * - pathname: quando cambia indica che la route è cambiata
   * - setLoading: funzione per aggiornare lo stato loading nel context
   */
  useEffect(() => {
    setLoading(false);
  }, [pathname, setLoading]);

 
  if (loading) {
    return <LoadingComponent />;
  }

 
  return <>{children}</>;
}
