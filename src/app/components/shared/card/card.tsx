"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import "./card.css";
import Detail from "../detail/detail";
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

// Type guards
function isCliente(dato: Cliente | Visita | Contatto): dato is Cliente {
  return (dato as Cliente).ragSocCompleta !== undefined;
}

function isVisita(dato: Cliente | Visita | Contatto): dato is Visita {
  return (dato as Visita).IdAttivita !== undefined;
}

function isContatto(dato: Cliente | Visita | Contatto): dato is Contatto {
  return (
    (dato as Contatto).nome !== undefined &&
    (dato as Contatto).cognome !== undefined
  );
}

function generateDetailFields(dato): Field[] {
  let fields: Field[] = [];
  let keyMapping;

  if (isCliente(dato)) {
    keyMapping = {
      ragione_sociale: "ragSocCompleta",
      indirizzo: "indirizzo",
      citta: "citta",
      cap: "cap",
      provincia: "provincia",
      Regione: "idZona",
      Stato: "idPaese",
      tel: "tel",
      email: "email",
      note: "noteCliente",
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
      DescAttivita: "DescAttivita",
      DataAttivita: "DataAttivita",
      Ragione_Sociale: "RagSoc",
      note: "NoteAttivita",
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
  }if (isContatto(dato)) {
    keyMapping = {
       nome: 'nome',
        cognome: 'cognome',
        Rag_Sociale: 'ragioneSociale',
        cellulare: 'cellulare ',
        email: 'email',
        telefono: 'telefonoElaborato',
        paese: 'paeseClienteFornitore',
      
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

export default function Card({ title, fields, dato }: GenericCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const controls = useAnimation();

  const searchParams = useSearchParams();
  const editMode = searchParams.get("editMode");
  const deleteMode = searchParams.get("deleteMode");
  const router = useRouter();
  const pathname = usePathname();

  function onCloseDetail() {
    setShowDetail(false);
  }

  function onCloseEdit() {
    setShowDetail(false);
    router.replace(pathname);
  }

  function clearQueryParams() {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("deleteMode");
    current.delete("editMode");
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  }

  async function deleteDato() {
    try {
      console.log("Elimino:", dato);

      setShowDeleteConfirm(false);
      clearQueryParams();
    } catch (err) {
      console.error("Errore eliminazione:", err);
      clearQueryParams();
    }
  }

  const numericColors = [dato.Sem1, dato.Sem2, dato.Sem3, dato.Sem4];
  const colors = getColors(numericColors);

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

  return (
    <div className="cd-page flex h-full w-full font-sans text-base justify-center items-center m-0 p-0 cursor-default visible">
      <div className="cd-card w-[75%] max-h-[90vh] rounded-lg p-[5%] pt-[1%] my-0.5 shadow-md transition-shadow hover:shadow-lg flex flex-col justify-center overflow-auto md:w-[80%] md:h-[85%] cursor-default relative">
        <h3 className="cd-title text-xl mt-[3%] mb-2 font-semibold">{title}</h3>
        <div className="cd-fields flex flex-col gap-2 flex-grow">
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
                  className="cd-field-link card-link text-inherit cursor-pointer transition-colors duration-300 truncate"
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

      {showDetail && (
        // (editMode === "true" && schemaToUse && typeToUse ? (
        //   <FormEdit
        //     title={`Modifica ${title}`}
        //     fields={detailFields.map((f) => ({
        //       ...f,
        //       key: f.title.toString(),
        //     }))}
        //     onClose={onCloseEdit}

        //     type={typeToUse}
        //   />
        // ) :
        <Detail
          title={title}
          fields={generateDetailFields(dato)}
          visible={showDetail}
          onClose={onCloseDetail}
          flgCliente={isCliente(dato)}
          colors={colors}
        />
        // )
      )}

      {/* Popup deleteMode */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-[90%]">
            <h2 className="text-lg font-semibold mb-4">
              Sicuro di voler eliminare{" "}
              <span className="font-bold text-red-600">{nomeDato}</span>?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  clearQueryParams();
                  setShowDeleteConfirm(false);
                }}
              >
                No
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
