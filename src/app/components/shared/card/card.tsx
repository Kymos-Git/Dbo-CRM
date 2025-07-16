/**
 * GenericCard.tsx
 *
 * Componente generico per mostrare una "card" informativa.
 * Riceve un titolo e una lista di campi (fields), ognuno con titolo, valore e opzionalmente un link.
 *
 */

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import "./card.css"; // Import CSS per la card
import Detail from "../detail/detail";
import { Cliente, Contatto, Visita } from "@/app/interfaces/interfaces";
import { useAnimation, motion } from "framer-motion";
import { z, ZodObject } from "zod";

// Definizione del tipo per ogni campo della card
type CardField = {
  title: string | React.ReactNode; // Titolo del campo (stringa o nodo React per maggiore flessibilità)
  value: string; // Valore del campo (sempre stringa)
  href?: string; // Link opzionale per rendere il valore cliccabile
};

// Props del componente, include titolo generale e lista di campi
type GenericCardProps = {
  title: string;
  fields: CardField[];
  dato: Cliente | Visita | Contatto;
};

// Configurazione per mappare i campi degli schemi ai titoli visualizzati
type FieldConfig = {
  key: string;
  title: string;
  type: string;
  formatter?: (value: any) => string;
  condition?: (data: any) => boolean;
};

function isCliente(dato: Cliente | Visita | Contatto): dato is Cliente {
  return (dato as Cliente).ragSocCompleta !== undefined;
}

function isVisita(dato: Cliente | Visita | Contatto): dato is Visita {
  return (dato as Visita).IdAttivita !== undefined;
}

function isContatto(dato: Cliente | Visita | Contatto): dato is Contatto {
  return (dato as Contatto).nome !== undefined && (dato as Contatto).cognome !== undefined;
}

// Configurazioni per ogni tipo di dato
const fieldConfigurations: Record<string, FieldConfig[]> = {
  cliente: [
    { key: "ragSocCompleta", title: "Rag.Soc.", type: "text" },
    { key: "tel", title: "Telefono", type: "text" },
    { key: "email", title: "Email", type: "text" },
    { key: "indirizzo", title: "Indirizzo", type: "text" },
    { key: "citta", title: "Città", type: "text" },
    { key: "cap", title: "CAP", type: "text" },
    { key: "provincia", title: "Provincia", type: "text" },
    {
      key: "noteCliente",
      title: "Note",
      type: "text",
      condition: (data) => data.noteCliente && data.noteCliente.trim() !== "",
    },
  ],
  visita: [
    { key: "RagSoc", title: "Rag.Soc", type: "text" },
    {
      key: "DataAttivita",
      title: "Data",
      type: "text",
      formatter: (value) => {
        if (value instanceof Date) {
          return value.toLocaleDateString("it-IT");
        }
        return value?.toString() || "";
      },
    },
    { key: "DescAttivita", title: "Descrizione", type: "text" },
    { key: "NoteAttivita", title: "Note", type: "text" },
  ],
  contatto: [
    { key: "nome", title: "Nome", type: "text" },
    { key: "cognome", title: "Cognome", type: "text" },
    { key: "ragioneSociale", title: "Azienda", type: "text" },
    { key: "cellulare", title: "Cellulare", type: "text" },
    { key: "email", title: "Email", type: "text" },
    { key: "telefonoElaborato", title: "Telefono", type: "text" },
    { key: "paeseClienteFornitore", title: "Paese", type: "text" },
    { key: "tipoContatto", title: "Tipo Contatto", type: "text" },
  ],
};

// Funzione per generare detailFields dinamicamente
function generateDetailFields(
  dato: Cliente | Visita | Contatto,
  schema?: z.ZodSchema<any>
): { title: string; value: string; type: string }[] {
  // Determina il tipo di dato
  let dataType: string;
  if (isCliente(dato)) {
    dataType = "cliente";
  } else if (isVisita(dato)) {
    dataType = "visita";
  } else if (isContatto(dato)) {
    dataType = "contatto";
  } else {
    return [];
  }

  const config = fieldConfigurations[dataType];
  if (!config) return [];

  // Se è fornito uno schema Zod, usa le sue chiavi
  let fieldsToProcess = config;
  if (schema && schema instanceof ZodObject) {
    const shape = schema.shape;
    const schemaKeys = Object.keys(shape);
    fieldsToProcess = config.filter((field) => schemaKeys.includes(field.key));
  }

  return fieldsToProcess
    .filter((field) => {
      // Applica la condizione se presente
      if (field.condition) {
        return field.condition(dato);
      }
      return true;
    })
    .map((field) => {
      const rawValue = (dato as any)[field.key];
      let formattedValue: string;

      if (field.formatter) {
        formattedValue = field.formatter(rawValue);
      } else if (rawValue !== undefined && rawValue !== null) {
        formattedValue = rawValue.toString();
      } else {
        formattedValue = "";
      }

      return {
        title: field.title,
        value: formattedValue,
        type: field.type,
      };
    });
}

export default function GenericCard({ title, fields, dato }: GenericCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const controls = useAnimation();

  function onCloseDetail() {
    setShowDetail(false);
  }

  // Esempio di come usare la funzione con uno schema Zod specifico
  // Puoi passare lo schema come parametro opzionale
  const schemaVisita = z.object({
    DescAttivita: z.string(),
    DataAttivita: z.date(),
    RagSoc: z.string(),
    NoteAttivita: z.string(),
  });

  // Genera i detailFields dinamicamente
  let detailFields: { title: string; value: string; type: string }[] = [];

  if (isVisita(dato)) {
    // Per le visite, usa lo schema Zod specifico
    detailFields = generateDetailFields(dato, schemaVisita);
  } else {
    // Per altri tipi, usa la configurazione standard
    detailFields = generateDetailFields(dato);
  }

  const numericColors: number[] = [dato.Sem1, dato.Sem2, dato.Sem3, dato.Sem4];
  const colors = getColors(numericColors);

  function getColors(values: number[]): string[] {
    const colors: string[] = [];

    values.forEach((c) => {
      switch (c) {
        case 1:
          colors.push("#32CD32"); // verde
          break;
        case 2:
          colors.push("#F3A83B"); // arancio
          break;
        case 3:
          colors.push("#EB443A"); // rosso
          break;
        case 4:
          colors.push("#3E94F7"); // blu
          break;
        case 5:
          colors.push("#FF76C0"); // fucsia
          break;
        case 6:
          colors.push("#bdb76b"); // darkkhaki
          break;
        default:
          colors.push("#dcdcdc"); // grigio
          break;
      }
    });

    return colors;
  }

  const handleAnimation = async () => {
    await controls.start({
      rotate: [0, 360],
      transition: { duration: 1 },
    });
    setShowDetail(true);
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

  return (
    // Container principale che centra la card nella pagina con flexbox
    <div className="cd-page flex h-full w-full font-sans text-base justify-center items-center m-0 p-0 cursor-default visible">
      {/* Card vera e propria con larghezza e altezza massima, bordi arrotondati, padding e ombre */}
      <div
        className="cd-card w-[75%] max-h-[90vh] rounded-lg
                   p-[5%] pt-[1%] my-0.5 shadow-md transition-shadow hover:shadow-lg
                   flex flex-col justify-center overflow-auto
                   md:w-[80%] md:h-[85%] cursor-default relative"
      >
        {/* Titolo principale della card */}
        <h3 className="cd-title text-xl mt-[3%] mb-2 font-semibold">{title}</h3>

        {/* Container dei campi, layout verticale con spazio fra di loro */}
        <div className="cd-fields flex flex-col gap-2 flex-grow">
          {/* Mappa tutti i campi passati come props */}
          {fields.map((field, index) => (
            <p
              key={index}
              className="cd-field-row flex items-center gap-1 truncate max-w-full"
            >
              {/* Titolo del campo, non si restringe mai */}
              <strong className="cd-field-label flex-shrink-0">{field.title}</strong>{" "}
              {/* Se è presente href, mostra valore come link */}
              {field.href ? (
                <Link
                  href={field.href}
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd-field-link card-link text-inherit cursor-pointer transition-colors duration-300  truncate"
                >
                  {field.value}
                </Link>
              ) : (
                // Altrimenti mostra solo il valore testuale, con truncamento
                <span className="cd-field-value truncate">{field.value}</span>
              )}
            </p>
          ))}
        </div>

        <motion.div
          className={`cd-cube-grid w-[1.3rem] h-[1.3rem] cursor-pointer absolute bottom-4 right-4 `}
          onClick={handleAnimation}
          animate={controls}
        >
          <div className="cd-cube rotate-90" style={{ backgroundColor: colors[0] }}></div>
          <div className="cd-cube " style={{ backgroundColor: colors[1] }}></div>
          <div className="cd-cube rotate-180" style={{ backgroundColor: colors[2] }}></div>
          <div className="cd-cube rotate-90" style={{ backgroundColor: colors[3] }}></div>
        </motion.div>
      </div>

      {showDetail && detailFields && (
        <Detail
          title={title}
          fields={detailFields}
          visible={showDetail}
          onClose={onCloseDetail}
          flgCliente={isCliente(dato as Cliente)}
          colors={colors}
        />
      )}
    </div>
  );
}
  