/**
 * ThemeRegistry.tsx
 * 
 * Componente wrapper per fornire il supporto al tema (light/dark) usando la libreria next-themes.
 * 
 * Funzionalità:
 * - Usa ThemeProvider per gestire il tema dell'app.
 * - Il tema viene applicato aggiungendo una classe CSS al root (attribute="class").
 * - Usa il tema di sistema come default.
 * - Abilita il cambio automatico in base al sistema operativo dell’utente (enableSystem).
 * - Avvolge i componenti figli in modo che possano accedere al contesto tema.
 */

"use client";

import { ThemeProvider } from "next-themes";

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
