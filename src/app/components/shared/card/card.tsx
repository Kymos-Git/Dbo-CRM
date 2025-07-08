/**
 * GenericCard.tsx
 * 
 * Componente generico per mostrare una "card" informativa.
 * Riceve un titolo e una lista di campi (fields), ognuno con titolo, valore e opzionalmente un link.
 * 
 */

"use client";

import Link from "next/link";
import React from "react";
import "./card.css";  // Import CSS per la card

// Definizione del tipo per ogni campo della card
type CardField = {
  title: string | React.ReactNode; // Titolo del campo (stringa o nodo React per maggiore flessibilità)
  value: string;                   // Valore del campo (sempre stringa)
  href?: string;                  // Link opzionale per rendere il valore cliccabile
};

// Props del componente, include titolo generale e lista di campi
type GenericCardPropts = {
  title: string;          // Titolo della card
  fields: CardField[];    // Array di campi da mostrare nella card
};

export default function GenericCard({ title, fields }: GenericCardPropts) {
  return (
    // Container principale che centra la card nella pagina con flexbox
    <div className="cd-page flex h-full w-full font-sans text-base justify-center items-center m-0 p-0">

      {/* Card vera e propria con larghezza e altezza massima, bordi arrotondati, padding e ombre */}
      <div
        className="cd-card w-[75%] max-h-[90vh] rounded-lg
                   p-[5%] pt-[1%] my-0.5 shadow-md transition-shadow hover:shadow-lg
                   flex flex-col justify-center overflow-auto
                   md:w-[80%] md:h-[85%]"
      >
        {/* Titolo principale della card */}
        <h3 className="cd-title text-xl mt-[3%] mb-2 font-semibold">
          {title}
        </h3>

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
                <Link href={field.href} passHref target="_blank" rel="noopener noreferrer" className="cd-field-link card-link text-inherit cursor-pointer transition-colors duration-300  truncate" >
                    {field.value}
                </Link>
              ) : (
                // Altrimenti mostra solo il valore testuale, con truncamento
                <span className="cd-field-value truncate">{field.value}</span>
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
