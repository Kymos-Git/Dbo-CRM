/**
 * ThemeToggle.tsx
 *
 * Componente per il toggle del tema light/dark.
 */

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export default function ThemeToggle({ position, className = "", style = {} }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Combina position, style personalizzato e posizione assoluta se necessario
  const finalStyle = {
    ...(position && { position: 'absolute' as const }),
    ...position,
    ...style
  };

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`w-5 h-5 p-2 rounded-lg transition cursor-pointer md:hover:scale-110 ${className}`}
      style={finalStyle}
    >
      {theme === "dark" ? <Sun size={30} /> : <Moon size={30} />}
    </button>
  );
}