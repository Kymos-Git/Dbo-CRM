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
  id: string | null;
}

// Rimuove underscore e spazi per normalizzare i titoli
const normalize = (str: string) =>
  str.trim().toLowerCase().replace(/[_\s]/g, "");

export default function FormEdit({ title, fields, onClose, type, id }: Props) {
  const { fetchWithAuth } = useAuth();

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

  // Mappa dinamica tra campo normalizzato e chiave Zod originale
  const schemaKeyMap = Object.keys(schema.shape).reduce((acc, key) => {
    acc[normalize(key)] = key;
    return acc;
  }, {} as Record<string, string>);

  // Mappa i titoli dei campi in base alla corrispondenza con le chiavi dello schema
  const getSchemaKey = (title: string): string =>
    schemaKeyMap[normalize(title)] || title;

  // Stato iniziale del form
  const initialState: Record<string, string | number> = Object.fromEntries(
    fields.map((f) => [getSchemaKey(f.title), f.value ?? ""])
  );

  const [formState, setFormState] = useState(initialState);

  const handleChange = (title: string, value: string) => {
    const schemaKey = getSchemaKey(title);
    setFormState((prev) => ({ ...prev, [schemaKey]: value }));
  };

  const transformKeys = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      const newKey = key.replace(/_/g, "");
      newObj[newKey] = obj[key];
    }
    return newObj;
  };

  const sendData = async () => {
    try {
      const parsed = schema.parse(formState);
      const transformed = transformKeys(parsed);

      switch (type) {
        case "cliente":
          await UpdateCliente(fetchWithAuth, { IdCliente: id, ...transformed });
          break;
        case "contatto":
          await UpdateContatto(fetchWithAuth, {
            IdContatto: id,
            ...transformed,
          });
          break;
        case "visita":
          await UpdateVisita(fetchWithAuth, { IdAttivita: id, ...transformed });
          break;
      }

      toast.success("Dati inviati con successo");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err === "Nessuna modifica eseguita"
          ? err
          : "Errore nell'invio dei dati"
      );
    }
  };

  const resetFields = () => {
    setFormState(initialState);
    toast.info("Campi ripristinati");
  };

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
        {otherFields.map((field) => {
          const key = getSchemaKey(field.title);
          return (
            <label
              key={field.title}
              className="frm-modal-label mb-4 text-xs tracking-widest uppercase block text-[var(--primary)]"
            >
              {field.title}
              <input
                type={field.type}
                value={formState[key] || ""}
                onChange={(e) => handleChange(field.title, e.target.value)}
                className="w-full text-sm px-2 focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px] text-[var(--text)]"
              />
            </label>
          );
        })}
      </form>

      {noteField && (
        <div className="mt-4 px-1">
          <label className="frm-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]">
            {noteField.title}
          </label>
          <NoteField
            value={
              (formState[getSchemaKey(noteField.title)] as string) || ""
            }
            onChange={(e) => handleChange(noteField.title, e)}
            readonly={false}
          />
        </div>
      )}
    </Form>
  );
}
