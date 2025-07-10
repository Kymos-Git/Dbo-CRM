/**
 * GenericCard.tsx
 *
 * Componente generico per mostrare una "card" informativa.
 * Riceve un titolo e una lista di campi (fields), ognuno con titolo, valore e opzionalmente un link.
 *
 */

"use client";

import Link from "next/link";
import React, {  useEffect, useState } from "react";
import "./card.css"; // Import CSS per la card
import Detail from "../detail/detail";
import { Cliente, Contatto, Visita } from "@/app/interfaces/interfaces";
import { useAnimation,motion } from "framer-motion";

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

export default function GenericCard({ title, fields, dato }: GenericCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const controls=useAnimation();

  function onCloseDetail() {
    setShowDetail(false);
  }

  function isCliente(dato: Cliente | Visita | Contatto): dato is Cliente {
    return (dato as Cliente).ragSocCompleta !== undefined;
  }

  function isVisita(dato: Cliente | Visita | Contatto): dato is Visita {
    return (dato as Visita).IdAttivita !== undefined;
  }

  function isContatto(dato: Cliente | Visita | Contatto): dato is Contatto {
    return (dato as Contatto).idContatto !== undefined;
  }

  let detailFields: { title: string; value: string; type: string }[] = [];

  if (isCliente(dato)) {
    detailFields = [
      { title: "Rag.Soc.", value: dato.ragSocCompleta, type: "text" },
      { title: "Telefono", value: dato.tel, type: "text" },
      { title: "Email", value: dato.email, type: "text" },
      { title: "Indirizzo", value: dato.indirizzo, type: "text" },
      { title: "Città", value: dato.citta, type: "text" },
      { title: "CAP", value: dato.cap, type: "text" },
      { title: "Provincia", value: dato.provincia || "", type: "text" },
      ...(dato.noteCliente
        ? [{ title: "Note", value: dato.noteCliente, type: "text" }]
        : []),
    ];
  } else if (isVisita(dato)) {
    detailFields = [
      { title: "Rag.Soc", value: dato.RagSoc, type: "text" },
      { title: "Data", value: dato.DataAttivita, type: "text" },
      { title: "Descrizione", value: dato.DescAttivita, type: "text" },
      { title: "Note", value: dato.NoteAttivita, type: "text" },
    ];
  } else if (isContatto(dato)) {
    detailFields = [
      { title: "Nome", value: dato.nome, type: "text" },
      { title: "Cognome", value: dato.cognome, type: "text" },
      { title: "Azienda", value: dato.ragioneSociale, type: "text" },
      { title: "Cellulare", value: dato.cellulare, type: "text" },
      { title: "Email", value: dato.email, type: "text" },
      { title: "Telefono", value: dato.telefonoElaborato, type: "text" },
      { title: "Città", value: dato.cittaClienteFornitore, type: "text" },
      { title: "Paese", value: dato.paeseClienteFornitore, type: "text" },
      { title: "Tipo Contatto", value: dato.tipoContatto, type: "text" },
    ];
  }

  function getColor(value: number) {
    let color: string = "#dcdcdc";

    switch (value) {
      case 1:
        color = "#32CD32";
        break; //verde
      case 2:
        color = "#F3A83B";
        break; //arancio
      case 3:
        color = "#EB443A";
        break; //rosso
      case 4:
        color = "#3E94F7";
        break; //blu
      case 5:
        color = "#FF76C0";
        break; //fucsia
      case 6:
        color = "#bdb76b";
        break; //darkkhaki
      default:
        color = "#dcdcdc";
        break; //grigio
    }

    return color;
  }

  const handleAnimation=async ()=>{
    await controls.start({
      rotate:[0,360],
      transition:{duration:1}
    })
    setShowDetail(true);
  }



  return (
    // Container principale che centra la card nella pagina con flexbox
    <div className="cd-page flex h-full w-full font-sans text-base justify-center items-center m-0 p-0 cursor-default">
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
              <strong className="cd-field-label flex-shrink-0">
                {field.title}
              </strong>{" "}
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
          <div
            className="cd-cube"
            style={{ backgroundColor: getColor(dato.Sem1) }}
          ></div>
          <div
            className="cd-cube"
            style={{ backgroundColor: getColor(dato.Sem2) }}
          ></div>
          <div
            className="cd-cube"
            style={{ backgroundColor: getColor(dato.Sem3) }}
          ></div>
          <div
            className="cd-cube"
            style={{ backgroundColor: getColor(dato.Sem4) }}
          ></div>
        </motion.div>

        
      </div>

      {showDetail && detailFields && (
          <Detail
            title={title}
            fields={detailFields}
            visible={showDetail}
            onClose={onCloseDetail}
            flgCliente={isCliente(dato as Cliente)}
          />
        )}
    </div>

    
  );
}
