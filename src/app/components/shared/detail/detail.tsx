/**
 * Detail.tsx
 *
 * Componente per mostrare una sezione dettagliata con titolo e campi editabili.
 * Ogni campo è rappresentato da un componente `ExpandableInput` che mostra un input espandibile.
 *
 */

"use client";

import ExpandableInput from "../expandedInput/expandeInput"; // Componente input espandibile personalizzato
import "./detail.css"; // Stili CSS specifici per Detail

// Definizione tipo per ogni campo da mostrare
type Field = {
  title: string; // Titolo del campo
  value: string; // Valore del campo
  type: string; // Tipo di input (es. "text", "password", ecc)
};

// Props del componente Detail
type DetailProps = {
  title: string; // Titolo principale della sezione
  fields: Field[]; // Array di campi da mostrare nella griglia
};

export default function Detail({ title, fields }: DetailProps) {
  return (
    <>
      {/* Titolo della sezione con stile responsivo e margini */}
      <h3 className="dt-title text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8 tracking-wide">
        {title}
      </h3>

      {/* Form con griglia responsive:
          - 2 colonne su mobile e sm
          - 3 colonne su md e superiori
          - Spaziatura orizzontale e verticale definita */}
      <form
        className="
          dt-form
          grid 
          grid-cols-2
          sm:grid-cols-2 
          md:grid-cols-3 
          gap-x-6 
          gap-y-5
          auto-rows-min
        "
      >
        {/* Mappa dei campi per creare ogni input */}
        {fields.map(({ title, value, type }, i) => (
          <div
            key={i}
            className={`dt-field mb-4 ${
              (title.toLowerCase() === "note" || title.toLowerCase()==='descrizione') ? "large-field" : ""
            }`}
          >
            <ExpandableInput label={title} value={value} type={type} />
          </div>
        ))}
      </form>
    </>
  );
}
