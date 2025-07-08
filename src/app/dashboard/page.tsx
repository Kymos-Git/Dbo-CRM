/**
 * Componente principale della pagina Home.
 * Avvolge il componente Homepage con ProtectedRoute,
 * che si occupa di proteggere la pagina mostrando il contenuto
 * solo se l’utente è autenticato.
 */

"use client";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import Homepage from "../components/home/homepage/homepage";



export default function Home() {
  return (
    // ProtectedRoute gestisce la protezione della pagina
    <ProtectedRoute>
      {/* Componente principale della homepage */}
      <Homepage />
    </ProtectedRoute>
  );
}
