"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z, ZodObject, ZodRawShape } from "zod";
import "react-toastify/dist/ReactToastify.css";

import {
  schemaCliente,
  schemaContatto,
  schemaVisita,
} from "@/app/interfaces/schemas";
import { sendCliente, sendContatto, sendVisita } from "@/app/services/api";

import { useAuth } from "@/app/context/authContext";
import NoteField from "./Notefield";
import Form from "./form";



type FormProps = {
  type: "cliente" | "contatto" | "visita";
  onClose: () => void;
};

type Field = {
  name: string;
  type: "text" | "number" | "checkbox" | "date";
};

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
  const [schema, setSchema] = useState<ZodObject<ZodRawShape> | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean>
  >({});

  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const { schema: selectedSchema, fields: generatedFields } =
      getSchemaAndFields(type);

    const initialData: Record<string, string | number | boolean> = {};
    generatedFields.forEach(({ name, type }) => {
      initialData[name] = type === "checkbox" ? false : "";
    });

    setSchema(selectedSchema);
    setFields(generatedFields);
    setFormData(initialData);
  }, [type]);

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

  const handleNoteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, note: value }));
  };

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

  const resetFields = () => {
    const resetData: Record<string, string | number | boolean> = {};
    fields.forEach(({ name, type }) => {
      resetData[name] = type === "checkbox" ? false : "";
    });
    setFormData(resetData);
    toast.info("Campi resettati");
  };

  if (!schema) return null;
  


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
            <NoteField
              value={formData["note"]}
              onChange={handleNoteChange}
              readonly={false}
            />
          </div>
        )}
      </div>
    </Form>
  );
}
