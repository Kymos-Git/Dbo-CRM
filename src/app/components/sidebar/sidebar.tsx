/**
 * Componente Sidebar
 * 
 * Gestisce la barra laterale di navigazione dell'applicazione.
 * Permette di navigare tra le sezioni principali (Chat, Contatti, Visite, Clienti),
 * e di eseguire azioni rapide come creare, modificare o eliminare elementi tramite un menu contestuale.
 * Contiene inoltre il toggle per il tema e la gestione dell'account utente.
 * Mantiene lo stato di apertura della sidebar e la gestione dei modali di form di aggiunta.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "@/app/globals.css";
import "@/app/components/sidebar/sidebar.css";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  Pencil,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import ThemeToggle from "../../theme/themeToggle";
import { useRouteLoading } from "@/app/context/routeContext";
import Account from "../account";
import { toast } from "react-toastify";
import FormAdd from "../shared/formAdd";

type FormType = "cliente" | "visita" | "contatto" | null;

export default function Sidebar() {
  // Stato per controllo apertura/chiusura della sidebar
  const [isOpen, setIsOpen] = useState(false);

  // Stato per tipo di form da mostrare nel modal (cliente, visita, contatto)
  const [formType, setFormType] = useState<FormType>(null);

  const pathname = usePathname();
  const { setLoading } = useRouteLoading();

  // Link principali della sidebar con etichetta, icona e percorso
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

  /**
   * Componente MenuButton (interno a Sidebar)
   * 
   * Pulsante con menu a tendina per selezionare azioni rapide su una sezione:
   * "Crea", "Modifica", "Elimina".
   * Gestisce apertura/chiusura del menu e chiusura cliccando fuori dal menu.
   * Al click sulle azioni esegue callback o naviga alla pagina con modalità specifica.
   * Mostra notifiche toast per informare l'utente sull'azione eseguita.
   */
  const MenuButton = ({
    label,
    href,
    onCreate,
  }: {
    label: string;
    href: string;
    onCreate: (label: string) => void;
  }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    /**
     * Gestisce l'azione selezionata nel menu.
     * @param action - azione scelta dall'utente ("crea", "modifica", "elimina")
     */
    const handleOption = (action: string) => {
      // Mappatura per articoli e nomi singolari usati nei messaggi toast
      const labelSingolari: Record<
        string,
        { articolo: string; nome: string }
      > = {
        clienti: { articolo: "il", nome: "cliente" },
        contatti: { articolo: "il", nome: "contatto" },
        visite: { articolo: "la", nome: "visita" },
      };

      const { articolo, nome } = labelSingolari[label];

      if (action === "crea") {
        onCreate(label);
        setIsOpen(false); // chiude la sidebar dopo creazione
      }

      if (action === "modifica") {
        router.push(`${href}?editMode=true`);
        toast.info(`Apri ${articolo} ${nome} che vuoi modificare`);
        setIsOpen(false);
      }

      if (action === "elimina") {
        router.push(`${href}?deleteMode=true`);
        toast.info(`Apri ${articolo} ${nome} che vuoi eliminare`);
        setIsOpen(false);
      }
    };

    // Effetto per gestire chiusura menu cliccando fuori dal menu
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setMenuOpen(false);
        }
      };

      if (menuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }

      // Cleanup listener
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [menuOpen]);

    return (
      <div className="relative inline-block" ref={menuRef}>
        <button
          className="h-4 w-4 bg-[#F3A83B] rounded-2xl cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          title={`Azioni ${label}`}
          aria-label={`Azioni per ${label}`}
        ></button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-[var(--bg)] border rounded-2xl shadow-md text-sm z-50 w-45 h-27 border-[var(--primary)] overflow-hidden">
            <ul className="flex flex-col flex-wrap">
              <li
                onClick={() => handleOption("crea")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                <span className="flex flex-row justify-start items-center">
                  <Plus size={20} className="mr-2" />
                  Crea
                </span>
              </li>
              <li
                onClick={() => handleOption("modifica")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                <span className="flex flex-row justify-start items-center">
                  <Pencil size={18} className="mr-2" />
                  Modifica
                </span>
              </li>
              <li
                onClick={() => handleOption("elimina")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                <span className="flex flex-row justify-start items-center">
                  <X size={20} className="mr-2" />
                  Elimina
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sidebar principale */}
      <div className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        {/* Bottone toggle per apertura/chiusura sidebar */}
        <div
          className="button"
          id="toggleBtn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Chiudi sidebar" : "Apri sidebar"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(!isOpen);
            }
          }}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>

        {/* Navigazione tra le sezioni */}
        <nav className="nav-links">
          {links.map(({ href, label, icon }, i) => {
            const isActive = pathname === href;

            return (
              <div
                className="line flex items-center justify-between"
                key={`line${i}`}
              >
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  scroll={true}
                  className={`link ${isActive ? "active" : ""}`}
                  onClick={() => {
                    // Imposta loading solo se si naviga verso pagina differente
                    if (pathname !== href) {
                      setLoading(true);
                    }
                    setIsOpen(false);
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>

                {/* Esclude "Chat" dal menu azioni rapide */}
                {label !== "Chat" && (
                  <MenuButton
                    label={label.toLowerCase()}
                    href={href}
                    onCreate={(tipo) => {
                      // Mappa etichette plurali in tipi di form
                      const map: Record<string, FormType> = {
                        clienti: "cliente",
                        contatti: "contatto",
                        visite: "visita",
                      };
                      setFormType(map[tipo]);
                    }}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Sezione account */}
        <div className="sb-account">
          <Account />
        </div>

        {/* Toggle tema con posizione personalizzata */}
        <ThemeToggle
          position={{
            bottom: "2.2rem",
            right: "4.5rem",
          }}
        />
      </div>

      {/* Modale form di aggiunta visibile se formType è impostato */}
      {formType && (
        <FormAdd type={formType} onClose={() => setFormType(null)} />
      )}
    </>
  );
}
