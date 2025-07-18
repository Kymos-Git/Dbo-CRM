"use client";

import { useAuth } from "@/app/context/authContext";
import { CircleUser, LogOut } from "lucide-react";
import { useState } from "react";


/**
 * Componente Account che gestisce la visualizzazione dell'icona utente
 * e la possibilità di effettuare il logout tramite un menu a comparsa.
 * Usa il contesto di autenticazione per eseguire il logout.
 */
export default function Account() {
  // Estrae la funzione di logout dal contesto di autenticazione
  const { logout } = useAuth();

  /**
   * Componente Wrapper che rappresenta il menu a comparsa con il pulsante logout.
   * Quando cliccato, esegue la funzione di logout.
   */
  function Wrapper() {
    return (
      <div className="ac-wrapper absolute bottom-[110%] right-[50%] w-[30vw] h-[10vh] rounded-2xl md:w-[10vw] bg-[var(--bg)] text-[var(--text)]">
        <div
          className="ac-logout justify-center items-center flex p-2 w-full rounded-2xl cursor-pointer hover:scale-110"
          onClick={() => logout()}
        >
          <LogOut size={20} />
          <span className="ml-4">Logout</span>
        </div>
      </div>
    );
  }

  // Stato locale che determina se il menu a comparsa è aperto o chiuso
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Icona utente cliccabile che apre/chiude il menu logout */}
      <div
        className="ac-account relative cursor-pointer md:hover:scale-110"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CircleUser size={30} />
      </div>
      {/* Visualizza il menu Wrapper solo se isOpen è true */}
      {isOpen && <Wrapper />}
    </div>
  );
}
