/**
 * FormAdd
 *
 * Componente che gestisce un form dinamico per l'inserimento di dati di tipo "cliente", "contatto" o "visita".
 * Utilizza gli schemi Zod per generare dinamicamente i campi del form e per validare i dati inseriti.
 * Gestisce l'invio dei dati tramite API specifiche e mostra notifiche di successo o errore.
 * Supporta il reset dei campi e l'automatica regolazione dell'altezza dell'area note.
 * Integra un componente Form per la visualizzazione modale con animazioni e bottoni di azione.
 */

"use client";



import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { z, ZodObject, ZodRawShape } from "zod";
import "react-toastify/dist/ReactToastify.css";

import {
  schemaCliente,
  schemaContatto,
  schemaVisita,
} from "@/app/interfaces/schemas";
import { sendCliente, sendContatto, sendVisita } from "@/app/services/api";
import Form from "../form/form";
import { useAuth } from "@/app/context/authContext";

type FormProps = {
  type: "cliente" | "contatto" | "visita";
  onClose: () => void;
};

type Field = {
  name: string;
  type: "text" | "number" | "checkbox" | "date";
};



/**
 * generateFieldsFromSchema
 * 
 * Funzione ausiliaria che, data una definizione di schema Zod, genera una lista di campi con nome e tipo
 * mappando i tipi Zod ai tipi input HTML standard (text, number, checkbox, date).
 */
function generateFieldsFromSchema<T extends ZodRawShape>(
  schema: ZodObject<T>
): Field[] {
  const shape = schema.shape;
  return Object.entries(shape).map(([key, field]) => {
    let type: Field["type"];

    if (field instanceof z.ZodString) {
      type = "text";
    } else if (field instanceof z.ZodNumber) {
      type = "number";
    } else if (field instanceof z.ZodBoolean) {
      type = "checkbox";
    } else if (field instanceof z.ZodDate) {
      type = "date";
    } else {
      type = "text"; 
    }

    return { name: key, type };
  });
}

/**
 * getSchemaAndFields
 * 
 * Data una stringa che indica il tipo di form ("cliente", "contatto", "visita"),
 * restituisce l'oggetto schema Zod corrispondente e l'elenco dei campi generati da tale schema.
 */
function getSchemaAndFields(type: "cliente" | "contatto" | "visita") {
  switch (type) {
    case "cliente":
      return {
        schema: schemaCliente,
        fields: generateFieldsFromSchema(schemaCliente),
      };
    case "contatto":
      return {
        schema: schemaContatto,
        fields: generateFieldsFromSchema(schemaContatto),
      };
    case "visita":
      return {
        schema: schemaVisita,
        fields: generateFieldsFromSchema(schemaVisita),
      };
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export default function FormAdd({ type, onClose }: FormProps) {
  // Stato per schema Zod attivo
  const [schema, setSchema] = useState<ZodObject<ZodRawShape> | null>(null);
  // Stato per campi dinamici del form
  const [fields, setFields] = useState<Field[]>([]);
  // Stato per dati inseriti dall'utente
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});

  /**
   * useEffect per inizializzare schema, campi e dati form all'avvio o al cambio del tipo di form
   */
  useEffect(() => {
    const { schema: selectedSchema, fields: generatedFields } = getSchemaAndFields(type);
    const initialData: Record<string, string | number | boolean> = {};

    generatedFields.forEach(({ name, type }) => {
      initialData[name] = type === "checkbox" ? false : "";
    });

    setSchema(selectedSchema);
    setFields(generatedFields);
    setFormData(initialData);
  }, [type]);

  /**
   * handleChange
   * 
   * Gestisce l'aggiornamento dello stato formData alla modifica di un campo input.
   * Gestisce in modo specifico i checkbox per aggiornare con boolean.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value =
      e.target instanceof HTMLInputElement && type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { fetchWithAuth } = useAuth();

  /**
   * sendData
   * 
   * Valida i dati tramite lo schema Zod e invia i dati tramite l'API corrispondente in base al tipo.
   * Mostra notifiche di successo o errore e chiude il form in caso di successo.
   */
  const sendData = async () => {
    if (!schema) return;
    try {
      const parsed = schema.parse(formData);
      switch (type) {
        case "cliente":
          await sendCliente(fetchWithAuth, parsed);
          break;
        case "contatto":
          await sendContatto(fetchWithAuth, parsed);
          break;
        case "visita":
          await sendVisita(fetchWithAuth, parsed);
          break;
      }
      toast.success("Dati inviati con successo");
      onClose();
    } catch (err) {
      toast.error(
        "Errore nella validazione dei dati: " +
          (err instanceof Error ? err.message : "Errore sconosciuto")
      );
    }
  };

  /**
   * resetFields
   * 
   * Reset dei valori di tutti i campi del form ai valori iniziali (checkbox a false, altri campi vuoti).
   * Mostra una notifica informativa.
   */
  const resetFields = () => {
    const resetData: Record<string, string | number | boolean> = {};
    fields.forEach(({ name, type }) => {
      resetData[name] = type === "checkbox" ? false : "";
    });
    setFormData(resetData);
    toast.info("Campi resettati");
  };

  if (!schema) return null;

  /**
   * NoteField
   * 
   * Componente interno per gestire un campo textarea "note" con altezza adattiva in base al contenuto.
   */
  function NoteField({ value }: { value: string | number | boolean }) {
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={ref}
        value={value as string}
        name="note"
        onChange={handleChange}
        className="w-full border-none rounded-xl resize-none min-h-[6rem] focus:outline-none focus:ring-0"
      />
    );
  }

  return (
    <Form
      visible={true}
      onClose={onClose}
      title={type}
      fglButtons={true}
      buttons={["Crea", "Svuota"]}
      onSend={sendData}
      onReset={resetFields}
    >
      <div className="frmAdd-container">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-2 auto-rows-min">
          {fields
            .filter(({ name }) => name !== "note")
            .map(({ name, type }, i) => (
              <div key={i} className="frm-field mb-4 w-full">
                <label className="frm-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]">
                  {name}
                </label>
                {type === "text" || type === "number" ? (
                  <input
                    name={name}
                    type={type}
                    value={formData[name] as string | number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px]"
                  />
                ) : type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name] as boolean}
                    onChange={handleChange}
                    className="mt-2"
                  />
                ) : type === "date" ? (
                  <input
                    type="date"
                    name={name}
                    value={formData[name] as string}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px] cursor-pointer"
                  />
                ) : null}
              </div>
            ))}
        </div>

        {fields.find(({ name }) => name === "note") && (
          <div className="FrmAdd-field mb-4 w-full">
            <label className="frm-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]">
              note
            </label>
            <NoteField value={formData["note"]} />
          </div>
        )}
      </div>
    </Form>
  );
}
