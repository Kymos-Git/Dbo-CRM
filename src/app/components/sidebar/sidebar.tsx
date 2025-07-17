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
  User,
  Users,
} from "lucide-react";
import ThemeToggle from "../../theme/themeToggle";
import { useRouteLoading } from "@/app/context/routeContext";
import Account from "../account/account";
import FormAdd from "../shared/formAdd/formAdd";
import { toast } from "react-toastify";

type FormType = "cliente" | "visita" | "contatto" | null;

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>(null);
  const pathname = usePathname();
  const { setLoading } = useRouteLoading();

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

    const handleOption = (action: string) => {

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
        setIsOpen(false)
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
        ></button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-[var(--bg)] border rounded-2xl shadow-md text-sm z-50 w-40 h-30   border-[var(--primary)]">
            <ul className="flex flex-col flex-wrap">
              <li
                onClick={() => handleOption("crea")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                Crea
              </li>
              <li
                onClick={() => handleOption("modifica")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                Modifica
              </li>
              <li
                onClick={() => handleOption("elimina")}
                className="px-3 py-2 hover:bg-[var(--bg-alt)] cursor-pointer"
              >
                Elimina
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div
          className="button"
          id="toggleBtn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>

        {/* Navigazione link */}
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
                    setLoading(true);
                    setIsOpen(false);
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>

                {label !== "Chat" && (
                  <MenuButton
                    label={label.toLowerCase()}
                    href={href}
                    onCreate={(tipo) => {
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

        <div className="sb-account">
          <Account />
        </div>

        <ThemeToggle
          position={{
            bottom: "2.2rem",
            right: "4.5rem",
          }}
        />
      </div>

      {/* Overlay form dinamico */}
      {formType && (
        <div className="form-overlay fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <FormAdd type={formType} onClose={() => setFormType(null)} />
        </div>
      )}
    </>
  );
}
