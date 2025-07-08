/**
 * Sidebar.tsx
 *
 * Componente Sidebar per la navigazione laterale in un’app Next.js.
 *
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/globals.css";
import "@/app/components/sidebar/sidebar.css";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  User,
  Users,
} from "lucide-react";
import ThemeToggle from "../../theme/themeToggle";
import { useRouteLoading } from "@/app/context/routeContext";
import Account from "../account/account";

export default function Sidebar() {
  // Stato per controllare apertura/chiusura sidebar (mobile)
  const [isOpen, setIsOpen] = useState(false);

  // Hook Next.js per ottenere pathname attuale (es. "/dashboard/contatti")
  const pathname = usePathname();

  const { setLoading } = useRouteLoading();

  // Array dei link da mostrare nella sidebar, con icone e label
  const links = [
    {
      label: "Chat",
      icon: <MessageCircleMore size={20} />,
      href: "/dashboard",
    },
    {
      label: "Contatti",
      icon: <User size={20} />,
      href: "/dashboard/contatti",
    },
    {
      label: "Visite",
      icon: <BriefcaseBusiness size={20} />,
      href: "/dashboard/visite",
    },
    { label: "Clienti", icon: <Users size={20} />, href: "/dashboard/clienti" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
      {/* Bottone per aprire/chiudere la sidebar */}
      <div className="button" id="toggleBtn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </div>

      {/* Navigazione link */}
      <nav className="nav-links">
        {/* Componente per cambiare tema (light/dark) */}
        <ThemeToggle />

        {/* Mappatura dei link, con evidenziazione se attivi */}
        {links.map(({ href, label, icon }) => {
          // Controlla se il link è quello attivo
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              scroll={true}
              className={`link ${isActive ? "active" : ""}`} // aggiunge classe active se selezionato
              onClick={() => {
                console.log("cliccato");
                setLoading(true);
                setIsOpen(!isOpen);
              }} // chiude la sidebar cliccando su link (utile su mobile)
            >
              {/* Icona + label */}
              <span className="icon">{icon}</span> {label}
            </Link>
          );
        })}
      </nav>

      <div className="sb-account">
        <Account />
      </div>
    </div>
  );
}
