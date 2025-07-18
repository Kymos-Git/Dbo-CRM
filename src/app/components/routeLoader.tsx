/**
 * RouteLoader.tsx
 * 
 * Questo componente funge da wrapper per la gestione dello stato di caricamento durante i cambi di route
 * in un'app Next.js. Utilizza un context custom per tracciare se la navigazione è in corso (loading)
 * e mostra un componente di caricamento finché il caricamento è attivo. Quando la route cambia,
 * disattiva automaticamente il loader.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouteLoading } from "@/app/context/routeContext";
import { LoadingComponent } from "./loading/loading";

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  // Estrae lo stato di caricamento e la funzione per aggiornarlo dal context personalizzato
  const { loading, setLoading } = useRouteLoading();

  // Recupera il pathname corrente della pagina, usato per rilevare i cambi di route
  const pathname = usePathname();

  // Effetto che si attiva al cambiamento del pathname,
  // utilizzato per disattivare il loader una volta completata la navigazione
  useEffect(() => {
    setLoading(false);
  }, [pathname, setLoading]);

  // Se è attivo lo stato di caricamento, mostra il componente di loading
  if (loading) {
    return <LoadingComponent />;
  }

  // Altrimenti renderizza normalmente i contenuti figli passati
  return <>{children}</>;
}
