import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";

import { schemaCliente } from "@/app/interfaces/schemaCliente";
import { schemaContatto } from "@/app/interfaces/schemaContatto";
import { schemaVisita } from "@/app/interfaces/schemaVisita";
import { sendCliente, sendContatto, sendVisita } from "@/app/services/api";
import Form from "../form/form";

type formProps = {
  type: "cliente" | "contatto" | "visita";
  onClose: () => void;
};

type Field = {
  name: string;
  type: string;
};

function generateFieldsFromSchema(schema: z.ZodObject<any>): Field[] {
  const shape = schema.shape;
  return Object.keys(shape).map((key) => {
    const field = shape[key];
    let type: string;

    switch (true) {
      case field instanceof z.ZodString:
        type = "text";
        break;
      case field instanceof z.ZodNumber:
        type = "number";
        break;
      case field instanceof z.ZodBoolean:
        type = "checkbox";
        break;
      case field instanceof z.ZodDate:
        type = "date";
        break;
      default:
        type = "text";
    }

    return {
      name: key,
      type,
    };
  });
}

export default function FormAdd({ type, onClose }: formProps) {
  const [schema, setSchema] = useState<z.ZodObject<any> | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    let selectedSchema: z.ZodObject<any>;
    switch (type) {
      case "cliente":
        selectedSchema = schemaCliente;
        break;
      case "contatto":
        selectedSchema = schemaContatto;
        break;
      case "visita":
        selectedSchema = schemaVisita;
        break;
      default:
        return;
    }

    const generatedFields = generateFieldsFromSchema(selectedSchema);
    const initialData: Record<string, any> = {};

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

  const sendData = async () => {
    if (!schema) return;
    try {
      const parsed = schema.parse(formData);
      switch (type) {
        case "cliente":
          await sendCliente(parsed);
          break;
        case "contatto":
          await sendContatto(parsed);
          break;
        case "visita":
          await sendVisita(parsed);
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
    const resetData: Record<string, any> = {};
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
    >
        <div className="frmAdd-buttons flex items-center space-x-2 ml-2 absolute -top-21 -right-5 z-50 w-40 md:-top-18">
          <button
            className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
            onClick={sendData}
            name="invia"
            type="button"
          >
            Crea
          </button>

          <button
            className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
            onClick={resetFields}
            name="reset"
            type="button"
          >
            Svuota
          </button>
        </div>

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
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px]"
                    />
                  ) : type === "checkbox" ? (
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  ) : type === "date" ? (
                    <input
                      type="date"
                      name={name}
                      value={formData[name]}
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
              <textarea
                name="note"
                value={formData["note"]}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[100px]"
              />
            </div>
          )}
        </div>
    </Form>
  )
}
