/**
 * ThemeToggle.tsx
 * 
 * Componente per il toggle del tema light/dark.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();   // Prende tema e funzione per cambiarlo
  const [mounted, setMounted] = useState(false); // Stato per sapere se il componente è montato

  // useEffect per settare mounted a true solo dopo che il componente è montato (evita mismatch SSR)
  useEffect(() => setMounted(true), []);

  // Se il componente non è ancora montato, non renderizza nulla (null)
  if (!mounted) return null; 

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}  // toggle tema
      className="w-5 h-5 p-2 rounded-lg transition absolute bottom-9 md:bottom-8 right-20 cursor-pointer md:hover:scale-110"
    >
      {/* Icona cambia in base al tema attuale */}
      {theme === "dark" ? <Sun size={30}/> : <Moon size={30} />}
    </button>
  );
}
