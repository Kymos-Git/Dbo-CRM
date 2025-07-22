/**
 * Componente Card
 *
 * Questo componente gestisce la visualizzazione di una card dinamica che può rappresentare
 * un Cliente, un Contatto o una Visita, mostrando i relativi campi e dati.
 * Supporta funzionalità di dettaglio, modifica e cancellazione con animazioni e gestione dei colori.
 * Utilizza type guards per determinare il tipo di dato e caricare i campi appropriati.
 */
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import "./card.css";
import Detail from "../detail";
import { Cliente, Contatto, Visita } from "@/app/interfaces/interfaces";
import { useAnimation, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ClienteKeys,
  ContattoKeys,
  schemaCliente,
  schemaContatto,
  schemaVisita,
  VisitaKeys,
} from "@/app/interfaces/schemas";

import {
  deleteCliente,
  deleteContatto,
  deleteVisita,
} from "@/app/services/api";
import { useAuth } from "@/app/context/authContext";
import { toast } from "react-toastify";
import FormEdit from "../formEdit";

type CardField = {
  title: string | React.ReactNode;
  value: string | number;
  href?: string;
};

type Field = {
  title: string;
  value: string | number;
  type: string;
};

type GenericCardProps = {
  title: string;
  fields: CardField[];
  dato: Cliente | Visita | Contatto;
};

/**
 * Type guard per verificare se il dato è un Cliente.
 */
function isCliente(dato: Cliente | Visita | Contatto): dato is Cliente {
  return (dato as Cliente).ragSocCompleta !== undefined;
}

/**
 * Type guard per verificare se il dato è una Visita.
 */
function isVisita(dato: Cliente | Visita | Contatto): dato is Visita {
  return (dato as Visita).IdAttivita !== undefined;
}

/**
 * Type guard per verificare se il dato è un Contatto.
 */
function isContatto(dato: Cliente | Visita | Contatto): dato is Contatto {
  return (
    (dato as Contatto).nome !== undefined &&
    (dato as Contatto).cognome !== undefined
  );
}

/**
 * Funzione che genera dinamicamente i campi da mostrare nella visualizzazione dettagliata
 * a seconda del tipo di dato (Cliente, Visita, Contatto).
 */
function generateDetailFields(dato: Cliente | Visita | Contatto): Field[] {
  let fields: Field[] = [];
  let keyMapping;

  if (isCliente(dato)) {
    keyMapping = {
      RagSoc: "ragSocCompleta",
      Indirizzo: "indirizzo",
      Citta: "citta",
      Cap: "cap",
      Provincia: "provincia",
      Zona: "idZona",
      Stato: "idPaese",
      Tel: "tel",
      Email: "email",
      Note: "noteCliente",
    };

    fields = (Object.entries(keyMapping) as [ClienteKeys, string][]).map(
      ([schemaKey, datoKey]) => {
        return {
          title: schemaKey.replace(/_/g, " ").toUpperCase(),
          value: dato[datoKey as keyof typeof dato] || "",
          type: schemaCliente.shape[schemaKey].constructor.name,
        };
      }
    );
  }
  if (isVisita(dato)) {
    keyMapping = {
      Desc_Attivita: "DescAttivita",
      Data_Attivita: "DataAttivita",
      RagSoc: "RagSoc",
      Note: "NoteAttivita",
    };

    fields = (Object.entries(keyMapping) as [VisitaKeys, string][]).map(
      ([schemaKey, datoKey]) => {
        return {
          title: schemaKey.replace(/_/g, " ").toUpperCase(),
          value: dato[datoKey as keyof typeof dato] || "",
          type: schemaVisita.shape[schemaKey].constructor.name,
        };
      }
    );
  }
  if (isContatto(dato)) {
    keyMapping = {
      Nome: "nome",
      Cognome: "cognome",
      RagSoc: "ragioneSociale",
      Cell: "cellulare",
      Email: "email",
      Telefono: "tel",
      Paese: "paeseClienteFornitore",
    };
    fields = (Object.entries(keyMapping) as [ContattoKeys, string][]).map(
      ([schemaKey, datoKey]) => {
        return {
          title: schemaKey.replace(/_/g, " ").toUpperCase(),
          value: dato[datoKey as keyof typeof dato] || "",
          type: schemaContatto.shape[schemaKey].constructor.name,
        };
      }
    );
  }

  return fields;
}

/**
 * Componente principale Card che mostra i dati, gestisce apertura dettaglio/modifica,
 * animazioni e conferma cancellazione.
 */
export default function Card({ title, fields, dato }: GenericCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const controls = useAnimation();

  const searchParams = useSearchParams();
  const editMode = searchParams.get("editMode");
  const deleteMode = searchParams.get("deleteMode");
  const router = useRouter();
  const pathname = usePathname();

  const id=()=>{
    let i=null
    if(isCliente(dato))i=dato.idCliente;
    if(isContatto(dato))i=dato.idContatto;
    if(isVisita(dato))i=dato.IdAttivita;
    return i!.toString();
  }
  /**
   * Chiude il dettaglio.
   */
  function onCloseDetail() {
    setShowDetail(false);
  }

  /**
   * Chiude la modalità modifica e aggiorna la URL per ricaricare la rispettiva pagina.
   */
  function onCloseEdit() {
  setShowDetail(false);

  const url = new URL(window.location.href);
  url.searchParams.set('reload', 'true');
  url.searchParams.delete('editMode');

  router.replace(url.pathname + url.search);
}

  /**
   * Rimuove i parametri di query relativi a editMode e deleteMode dalla URL.
   */
  function clearQueryParams() {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("deleteMode");
    current.delete("editMode");
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  }

  const { fetchWithAuth } = useAuth();

  /**
   * Gestisce la cancellazione del dato in base al tipo e aggiorna lo stato e la UI.
   */
  async function deleteDato() {
    try {
      if (isCliente(dato)) await deleteCliente(fetchWithAuth, dato.idCliente);
      if (isContatto(dato)) await deleteContatto(fetchWithAuth, dato.idContatto);
      if (isVisita(dato)) await deleteVisita(fetchWithAuth, dato.IdAttivita);

      setShowDeleteConfirm(false);
      clearQueryParams();
    } catch (err) {
      console.error("Errore eliminazione:", err);
      toast.error("Errore nell'eliminazione");
      clearQueryParams();
    }
  }

  /**
   * Mappa i valori numerici a colori specifici per la visualizzazione.
   */
  function getColors(values: number[]): string[] {
    return values.map((c) => {
      switch (c) {
        case 1:
          return "#32CD32";
        case 2:
          return "#F3A83B";
        case 3:
          return "#EB443A";
        case 4:
          return "#3E94F7";
        case 5:
          return "#FF76C0";
        case 6:
          return "#bdb76b";
        default:
          return "#dcdcdc";
      }
    });
  }

  const numericColors = [dato.Sem1, dato.Sem2, dato.Sem3, dato.Sem4];
  const colors = getColors(numericColors);

  /**
   * Gestisce l'animazione della "cube grid" e apre il dettaglio o la conferma di cancellazione.
   */
  const handleAnimation = async () => {
    await controls.start({
      rotate: [0, 360],
      transition: { duration: 1 },
    });
    if (deleteMode === "true") setShowDeleteConfirm(true);
    else setShowDetail(true);
  };

  useEffect(() => {
    const main = document.getElementsByTagName("main")[0] as HTMLElement;
    const grid = document.querySelector(".gr");
    if (showDetail) {
      grid?.classList.add("hidden");
      main.style.filter = "blur(5px)";
    } else {
      grid?.classList.remove("hidden");
      main.style.filter = "blur(0px)";
    }
  }, [showDetail]);

  const nomeDato = isCliente(dato)
    ? dato.ragSocCompleta
    : isContatto(dato)
    ? `${dato.nome} ${dato.cognome}`
    : isVisita(dato)
    ? dato.RagSoc
    : "elemento";

  // Calcola tipo dato localmente
  const tipoDato = isCliente(dato)
    ? "cliente"
    : isContatto(dato)
    ? "contatto"
    : isVisita(dato)
    ? "visita"
    : undefined;

  // Memoizza i campi per ottimizzare
  const detailFields = React.useMemo(() => generateDetailFields(dato), [dato]);

  return (
    <div className="cd-page flex h-full w-full font-sans text-base justify-center items-center m-0 p-0 cursor-default visible bg-[var(--bg)] text-[var(--text)]">
      <div className="cd-card w-[75%] max-h-[90vh] rounded-lg p-[5%] pt-[1%] my-0.5 shadow-md transition-shadow hover:shadow-lg flex flex-col justify-center overflow-auto md:w-[80%] md:h-[85%] cursor-default relative bg-[var(--bg)] border-[2px] border-[var(--bg-alt)]">

        <h3 className="cd-title text-xl mt-[3%] mb-2 font-semibold text-[var(--primary)]">{title}</h3>
        <div className="cd-fields flex flex-col gap-2 flex-grow text-[var(--text)]">
          {fields.map((field, index) => (
            <p
              key={index}
              className="cd-field-row flex items-center gap-1 truncate max-w-full"
            >
              <strong className="cd-field-label flex-shrink-0">
                {field.title}
              </strong>{" "}
              {field.href ? (
                <Link
                  href={field.href}
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd-field-link card-link text-inherit cursor-pointer transition-colors duration-300 truncate hover:text-[var(--primary)] hover:underline "
                >
                  {field.value}
                </Link>
              ) : (
                <span className="cd-field-value truncate">{field.value}</span>
              )}
            </p>
          ))}
        </div>

        <motion.div
          className={`cd-cube-grid w-[1.3rem] h-[1.3rem] cursor-pointer absolute bottom-4 right-4`}
          onClick={handleAnimation}
          animate={controls}
        >
          <div
            className="cd-cube rotate-90"
            style={{ backgroundColor: colors[0] }}
          ></div>
          <div className="cd-cube" style={{ backgroundColor: colors[1] }}></div>
          <div
            className="cd-cube rotate-180"
            style={{ backgroundColor: colors[2] }}
          ></div>
          <div
            className="cd-cube rotate-90"
            style={{ backgroundColor: colors[3] }}
          ></div>
        </motion.div>
      </div>

      {showDetail &&
        (editMode === "true" && tipoDato ? (
          <FormEdit
            title={`Modifica ${title}`}
            fields={detailFields}
            onClose={onCloseEdit}
            id={id()}
            type={tipoDato}
          />
        ) : (
          <Detail
            title={title}
            fields={detailFields}
            visible={showDetail}
            onClose={onCloseDetail}
            flgCliente={isCliente(dato)}
            colors={colors}
          />
        ))}

      {/* Popup di conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="bg-[var(--bg)] p-6 rounded-xl shadow-xl max-w-sm w-[90%] border-1 border-red-600">
            <h2 className="text-lg font-semibold mb-4">
              Sicuro di voler eliminare{" "}
              <span className="font-bold text-red-600">{nomeDato}</span>?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annulla
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={deleteDato}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
