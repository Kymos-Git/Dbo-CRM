/**
 * Componente ConfigLoader
 * Questo componente carica la configurazione globale dell’applicazione
 * da un file JSON statico (config.json) all’avvio.
 * La configurazione viene salvata in `window.APP_CONFIG` per essere
 * accessibile globalmente durante tutta l’app.
 * 
 * Utilizza useEffect per eseguire il fetch una sola volta al montaggio.
 */

"use client";

import { useEffect } from "react";

export default function ConfigLoader() {
  useEffect(() => {
    // Funzione asincrona per caricare la configurazione
    const loadConfig = async () => {
      // Fetch del file di configurazione dalla cartella public
      const res = await fetch("/config.json");
      const config = await res.json();

      // Salvataggio della config globale su window per accesso globale
      window.APP_CONFIG = config;
    };

    loadConfig();
  }, []); // Effettua il caricamento solo una volta al montaggio

  // Componente non rende nulla a schermo
  return <></>;
}
