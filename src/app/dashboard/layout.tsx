"use client";

/**
 * DashBoardLayout.tsx
 *
 *   layout principale per la dashboard dell'applicazione.
 */

import { ReactNode, useEffect } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { RouteLoadingProvider } from "../context/routeContext";
import RouteLoader from "../components/routeLoader/routeLoader";
import "./dashboard.css"

  

export default function DashBoardLayout({ children }: { children: ReactNode }) {

  useEffect(() => {
    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }

    // Imposta all’avvio
    setAppHeight();

    // Aggiorna al resize
    window.addEventListener('resize', setAppHeight);

    // Cleanup evento
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);




  return (
    // Contenitore flex per affiancare Sidebar e area contenuti
    <RouteLoadingProvider>
      <div className="flex h-screen w-screen"  style={{ height: 'var(--app-height)' }}>
        {/* Sidebar fissa sulla sinistra */}
        <Sidebar />

        {/* Area principale contenuti: cresce per occupare spazio disponibile */}
        <RouteLoader>
        <main className="overflow-hidden p-4 h-full w-full">
          {children}
        </main>
        </RouteLoader>
      </div>
    </RouteLoadingProvider>
  );
}
