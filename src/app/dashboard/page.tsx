/**
 * Home.tsx
 *
 * Componente principale della pagina Home.
 * Questo componente avvolge il componente Homepage con ProtectedRoute,
 * garantendo che il contenuto venga mostrato solo agli utenti autenticati.
 */

"use client";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import Homepage from "../components/home/homepage";

export default function Home() {
  
  return (
    <ProtectedRoute>
      <Homepage />
    </ProtectedRoute>
  );
}
