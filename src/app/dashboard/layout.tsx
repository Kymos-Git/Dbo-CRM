"use client";

/**
 * DashBoardLayout.tsx
 *
 * Questo componente funge da layout principale per la dashboard dell'applicazione.
 * Include la sidebar, il contesto per il caricamento delle route e un loader di navigazione.
 * Gestisce inoltre il settaggio dinamico dell'altezza dell'app in base alla finestra e
 * mostra un toast di benvenuto all’utente recuperando il nome utente da IndexedDB.
 */

import { ReactNode, useEffect } from "react";
import Sidebar from "../components/sidebar/sidebar";
import { RouteLoadingProvider } from "../context/routeContext";
import "./dashboard.css"
import { toast } from "react-toastify";
import { getItem } from "../lib/indexedDB";
import RouteLoader from "../components/routeLoader";

export default function DashBoardLayout({ children }: { children: ReactNode }) {
  
  /**
   * Funzione asincrona che mostra un toast di benvenuto all'utente,
   * recuperando il nome utente da IndexedDB.
   * Previene la duplicazione del toast tramite un ID univoco.
   */
  async function showWelcomeToast() {
    const toastId = 'welcome-toast';
    if (toast.isActive(toastId)) return;

    const username = await getItem('username');
    toast.success(`Benvenuto ${username}`, {
      toastId: toastId
    });
  }

  /**
   * useEffect che al montaggio del componente:
   * - chiama la funzione per mostrare il toast di benvenuto;
   * - definisce e imposta la variabile CSS '--app-height' con l’altezza della finestra;
   * - aggiunge un listener per aggiornare tale variabile al ridimensionamento della finestra;
   * - rimuove il listener al momento dello smontaggio.
   */
  useEffect(() => {
    showWelcomeToast();

    function setAppHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }

    setAppHeight();

    window.addEventListener('resize', setAppHeight);

    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <RouteLoadingProvider>
      <div className="flex h-screen w-screen" style={{ height: 'var(--app-height)' }}>
        <Sidebar />
        <RouteLoader>
          <main className="overflow-hidden p-4 h-full w-full">
            {children}
          </main>
        </RouteLoader>
      </div>
    </RouteLoadingProvider>
  );
}
