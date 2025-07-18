/**
 * FormEdit
 * 
 * Componente React che gestisce un form di modifica dati per entità di tipo "cliente", "contatto" o "visita".
 * Riceve in input i campi con i valori attuali da modificare e un titolo per il form.
 * Utilizza schemi Zod per la validazione dei dati aggiornati.
 * Gestisce l'invio dei dati modificati tramite API dedicate e mostra notifiche di successo o errore.
 * Permette di resettare i campi ai valori iniziali passati.
 * Gestisce in modo particolare il campo "note" con un textarea a altezza dinamica.
 */




"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  UpdateCliente,
  UpdateContatto,
  UpdateVisita,
} from "@/app/services/api";
import {
  schemaCliente,
  schemaContatto,
  schemaVisita,
} from "@/app/interfaces/schemas";
import { useAuth } from "@/app/context/authContext";
import NoteField from "./Notefield";
import Form from "./form";

type Field = {
  title: string;
  value: string | number;
  type: string;
};

interface Props {
  title: string;
  fields: Field[];
  onClose: () => void;
  type: "cliente" | "contatto" | "visita";
}


export default function FormEdit({ title, fields, onClose, type }: Props) {
  // Stato iniziale dei campi, costruito a partire dai valori passati via props
  const initialState: Record<string, string | number> = Object.fromEntries(
    fields.map((f) => [f.title, f.value ?? ""])
  );

  const { fetchWithAuth } = useAuth();

  // Stato locale per i dati modificati nel form
  const [formState, setFormState] =
    useState<Record<string, string | number>>(initialState);

  // Selezione dello schema Zod in base al tipo per la validazione
  const schema = (() => {
    switch (type) {
      case "cliente":
        return schemaCliente;
      case "contatto":
        return schemaContatto;
      case "visita":
        return schemaVisita;
      default:
        throw new Error("Tipo non supportato");
    }
  })();

  /**
   * handleChange
   * 
   * Aggiorna lo stato formState in risposta a modifiche sui campi input,
   * associando il valore modificato al campo indicato dalla chiave (key).
   */
  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * sendData
   * 
   * Valida i dati modificati tramite lo schema Zod e invia l'aggiornamento tramite
   * l'API corrispondente in base al tipo ("cliente", "contatto", "visita").
   * Mostra notifiche di successo o errore e chiude il form in caso di successo.
   */
  const sendData = async () => {
    try {
      const parsed = schema.parse(formState);

      switch (type) {
        case "cliente":
          await UpdateCliente(fetchWithAuth, parsed);
          break;
        case "contatto":
          await UpdateContatto(fetchWithAuth, parsed);
          break;
        case "visita":
          await UpdateVisita(fetchWithAuth, parsed);
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
   * Ripristina i valori dei campi allo stato iniziale passato in input.
   * Mostra una notifica informativa.
   */
  const resetFields = () => {
    setFormState(initialState);
    toast.info("Campi ripristinati");
  };

  // Separazione del campo note dagli altri campi per gestirlo con un componente specifico
  const otherFields = fields.filter(
    (field) => field.title.toLowerCase() !== "note"
  );
  const noteField = fields.find(
    (field) => field.title.toLowerCase() === "note"
  );

  return (
    <Form
      visible={true}
      fglButtons={true}
      title={title}
      onClose={onClose}
      buttons={["Modifica", "Annulla"]}
      onReset={resetFields}
      onSend={sendData}
    >
      <form className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-2 auto-rows-min">
        {otherFields.map((field) => (
          <label
            key={field.title}
            className="frm-modal-label mb-4 text-xs tracking-widest uppercase block text-[var(--primary)]"
          >
            {field.title}
            <input
              type={field.type}
              value={formState[field.title] || ""}
              onChange={(e) => handleChange(field.title, e.target.value)}
              className="w-full text-sm px-2 focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px] text-[var(--text)]"
            />
          </label>
        ))}
      </form>

      {noteField && (
        <div className="mt-4 px-1 ">
          <label className="frm-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]">
            {noteField.title}
          </label>
          <NoteField
            value={(formState[noteField.title] as string) || ""}
            onChange={(e) => handleChange(noteField.title,e)}
            readonly={false}
          />
        </div>
      )}
    </Form>
  );
}
