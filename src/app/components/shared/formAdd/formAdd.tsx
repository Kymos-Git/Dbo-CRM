import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";

import { schemaCliente } from "@/app/interfaces/schemaCliente";
import { schemaContatto } from "@/app/interfaces/schemaContatto";
import { schemaVisita } from "@/app/interfaces/schemaVisita";
import { sendCliente, sendContatto, sendVisita } from "@/app/services/api";

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

  return createPortal(
    <motion.div
      className="frm-container fixed inset-0 flex flex-row flex-wrap backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl md:pt-1 bg-[var(--bg)] border-1 border-[var(--primary)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
    >
      <motion.div
        className="frm-header relative flex items-center justify-between h-15 w-full mb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 w-10">
          <button
            onClick={onClose}
            className="frm-close transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
            aria-label="Chiudi dettaglio"
          />
        </div>

        <p className="text-center text-xs font-bold tracking-wide">
          {type.toUpperCase()}
        </p>

        <div className="frm-buttons flex items-center space-x-5 ml-2">
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
      </motion.div>

      <motion.div
        className="frm-main relative rounded-xl max-w-4xl w-full h-[85%] overflow-auto p-2 pt-0 md:w-full md:max-w-full"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dt-form">
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
            <div className="frm-field mb-4 w-full">
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
      </motion.div>
    </motion.div>,
    document.body
  );
}
