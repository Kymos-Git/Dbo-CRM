/**
 * Componente ConfigLoader
 * Questo componente React si occupa di caricare la configurazione globale
 * dell'applicazione da un file JSON statico (config.json) durante il montaggio del componente.
 * La configurazione caricata viene poi salvata nella proprietà globale `window.APP_CONFIG`
 * per essere accessibile in qualsiasi parte dell'applicazione.
 * 
 * Utilizza il hook useEffect per assicurarsi che il caricamento avvenga solo una volta,
 * al primo render del componente.
 */

"use client";

import { useEffect } from "react";

export default function ConfigLoader() {
  /**
   * Effettua il fetch del file di configurazione e salva il risultato
   * nell'oggetto globale `window.APP_CONFIG`.
   * Questo effetto viene eseguito una sola volta al montaggio del componente
   * grazie all'array di dipendenze vuoto.
   */
  useEffect(() => {
    const loadConfig = async () => {
      const res = await fetch("/config.json");
      const config = await res.json();

      window.APP_CONFIG = config;
    };

    loadConfig();
  }, []);

  return <></>;
}
