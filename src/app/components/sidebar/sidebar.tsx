"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/globals.css";
import "@/app/components/sidebar/sidebar.css";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  Plus,
  User,
  Users,
} from "lucide-react";
import ThemeToggle from "../../theme/themeToggle";
import { useRouteLoading } from "@/app/context/routeContext";
import Account from "../account/account";
import FormAdd from "../shared/formAdd/formAdd";

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

  const PlusButton = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: (label: string) => void;
  }) => {
    const controls = useAnimation();

    const handleClick = () => {
      controls.start({
        rotate: [0, -360],
        transition: { duration: 1 },
      });

      setTimeout(() => {
        onClick(label);
        setIsOpen(false);
      }, 1000);
    };

    return (
      <motion.button
        className="sb-addBtn"
        onClick={handleClick}
        animate={controls}
      >
        <Plus size={25} />
      </motion.button>
    );
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        {/* Bottone per aprire/chiudere la sidebar */}
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
              <div className="line" key={`line${i}`}>
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
                  <PlusButton
                    label={label.toLowerCase()}
                    onClick={(tipo) => {
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
