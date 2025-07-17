/**
 * GenericFilters.tsx
 *
 * Componente generico per la gestione di filtri con diversi tipi di input: testo, data e select.
 * Riceve una configurazione dei filtri (label, tipo, nome, opzioni) e gestisce lo stato interno dei valori.
 * Al momento del blur di ogni input, aggiorna lo stato e invoca la callback `onBlur` con i valori correnti.
 * Supporta valori iniziali opzionali per precompilare i filtri.
 */

import { useState } from "react";
import "./filters.css";

export type FilterConfig =
  | { type: "text"; label: string; name: string; placeholder?: string }
  | { type: "date"; label: string; name: string }
  | {
      type: "select";
      label: string;
      name: string;
      options: { value: string; label: string }[];
    };

type GenericFiltersProps = {
  filters: FilterConfig[];
  onBlur: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
};

export default function GenericFilters({
  filters,
  onBlur,
  initialValues = {},
}: GenericFiltersProps) {
  // Inizializza i valori di default per tutti i filtri con stringhe vuote
  const defaultValues = filters.reduce((acc, filter) => {
    acc[filter.name] = "";
    return acc;
  }, {} as Record<string, string>);

  // Stato interno che tiene traccia dei valori correnti di tutti i filtri,
  // combinando i valori di default e quelli eventualmente forniti inizialmente
  const [values, setValues] = useState<Record<string, string>>({
    ...defaultValues,
    ...initialValues,
  });

  /**
   * Funzione chiamata al blur di un input filtro.
   * Aggiorna lo stato interno con il nuovo valore e chiama la callback onBlur con i valori aggiornati.
   * @param name - nome del filtro modificato
   * @param value - valore corrente del filtro
   */
  function handleBlur(name: string, value: string) {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    onBlur(newValues);
  }

  return (
    <div
      className="ft-container w-full grow px-4 py-2 flex justify-center items-start pl-7"
      style={{ minHeight: "10vh" }}
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className="ft-form w-full h-full grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(30vw, 1fr))",
          gridAutoRows: "1fr",
        }}
      >
        {filters.map((filter) => (
          <div
            key={filter.name}
            className={`ft-filter-wrapper flex flex-col min-w-0 w-full ${
              filter.label === "Nome" ? "row-1" : ""
            }`}
            style={{ overflow: "hidden" }}
          >
            <label
              htmlFor={filter.name}
              className="ft-label font-semibold mb-1 text-m leading-tight"
              style={{ flexShrink: 0 }}
            >
              <span className="ft-label-text">{filter.label}</span>
            </label>

            {filter.type === "text" && (
              <input
                id={filter.name}
                type="text"
                placeholder={filter.placeholder}
                defaultValue={values[filter.name]}
                onBlur={(e) => handleBlur(filter.name, e.target.value)}
                className="ft-input w-full p-2 border-b-1 border-b-gray-400 text-s leading-snug focus:outline-none focus:shadow-md"
                style={{ minHeight: 32 }}
              />
            )}

            {filter.type === "date" && (
              <input
                id={filter.name}
                type="date"
                defaultValue={values[filter.name]}
                onBlur={(e) => handleBlur(filter.name, e.target.value)}
                className="ft-input w-full p-2 border-b-1 border-b-gray-400 text-s leading-snug focus:outline-none focus:shadow-md"
                style={{ minHeight: 32 }}
              />
            )}

            {filter.type === "select" && (
              <select
                id={filter.name}
                defaultValue={values[filter.name]}
                onBlur={(e) => handleBlur(filter.name, e.target.value)}
                className="ft-select w-full p-2 border-b-1 border-b-gray-400 text-s leading-snug focus:outline-none focus:shadow-md"
                style={{ minHeight: 32 }}
              >
                <option value="">Seleziona</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </form>
    </div>
  );
}
