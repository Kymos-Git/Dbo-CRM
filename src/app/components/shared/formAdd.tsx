"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z, ZodObject, ZodRawShape } from "zod";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

import {
  schemaCliente,
  schemaContatto,
  schemaVisita,
} from "@/app/interfaces/schemas";
import {
  getClienti,
  sendCliente,
  sendContatto,
  sendVisita,
} from "@/app/services/api";

import { useAuth } from "@/app/context/authContext";
import NoteField from "./Notefield";
import Form from "./form";
import { Cliente } from "@/app/interfaces/interfaces";
import { useRouter } from "next/navigation";

type FormProps = {
  type: "cliente" | "contatto" | "visita";
  onClose: () => void;
};

type Field = {
  name: string;
  type: "text" | "number" | "checkbox" | "date" | "select";
};

function generateFieldsFromSchema<T extends ZodRawShape>(
  schema: ZodObject<T>
): Field[] {
  const shape = schema.shape;
  return Object.entries(shape).map(([key, field]) => {
    let type: Field["type"];

    if (key.toLowerCase().includes("data")) {
      type = "date";
    } else if (key.toLowerCase().includes("ragsoc")) {
      type = "select";
    } else if (field instanceof z.ZodString) {
      type = "text";
    } else if (field instanceof z.ZodNumber) {
      type = "number";
    } else if (field instanceof z.ZodBoolean) {
      type = "checkbox";
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
  const router = useRouter();

  const [clienti, setClientiList] = useState<Cliente[]>([]);
  const [ragioniSoc, setRagioniList] = useState<string[]>([]);

  const { fetchWithAuth, username } = useAuth();

  const getRagSoc = async () => {
    try {
      const clienti = await getClienti(fetchWithAuth);
      const r: string[] = [];
      clienti.forEach((c) => {
        r.push(c.RagSocCompleta);
      });
      setClientiList(clienti);
      setRagioniList(r);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Errore durante il caricamento dei clienti");
    }
  };

  useEffect(() => {
    const { schema: selectedSchema, fields: generatedFields } =
      getSchemaAndFields(type);

    let modifiedFields = generatedFields;

    // Se il tipo è cliente, cambia i campi con tipo select in text
    if (type === "cliente") {
      modifiedFields = generatedFields.map((field) => {
        if (field.type === "select") {
          return { ...field, type: "text" };
        }
        return field;
      });
    }

    if (type === "visita" || type === "contatto") {
      getRagSoc();
    }

    const initialData: Record<string, string | number | boolean> = {};
    modifiedFields.forEach(({ name, type }) => {
      if (type === "checkbox") {
        initialData[name] = false;
      } else if (type === "date") {
        initialData[name] = new Date().toISOString().split("T")[0];
      } else {
        initialData[name] = "";
      }
    });

    setSchema(selectedSchema);
    setFields(modifiedFields);
    setFormData(initialData);
  }, [type]);

  useEffect(() => {
  if ((type === "visita" || type === "contatto") && ragioniSoc.length > 0) {
    setFormData((prev) => ({
      ...prev,
      RagSoc: prev.RagSoc || ragioniSoc[0],
    }));
  }
}, [ragioniSoc, type]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value } = e.target;

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleNoteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, note: value }));
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
    
    if (!schema) return;

    try {
      const parsed = schema.parse(formData);
      const transformed = transformKeys(parsed);

      if (type === "visita" && typeof transformed.RagSoc === "string") {
        const clienteSelezionato = clienti.find(
          (c) => c.RagSocCompleta === transformed.RagSoc
        );
        if (clienteSelezionato) {
          delete transformed.RagSoc;
          transformed.IdCliente = clienteSelezionato.IdCliente;
        } else {
          toast.error("Cliente selezionato non valido");
          return;
        }
      }

      switch (type) {
        case "cliente":
          await sendCliente(fetchWithAuth, transformed);
          break;
        case "contatto":
          await sendContatto(fetchWithAuth, transformed);
          break;
        case "visita":
          await sendVisita(fetchWithAuth, {
            SysUser: username,
            ...transformed,
          });
          break;
      }

      toast.success("Dati inviati con successo");
      const url = new URL(window.location.href);
      url.searchParams.set("reload", "true");
      router.replace(url.pathname + url.search);
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((issue) => toast.error(issue.message));
      } else {
        toast.error("Errore nell'invio dei dati");
      }
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
      formId={type}
    >
      <div className="frmAdd-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {fields
            .filter(({ name }) => name !== "note")
            .map(({ name, type }, i) => (
              <div key={i} className="mb-4 w-full">
                <label className="block text-xs font-semibold uppercase text-[var(--primary)] mb-1">
                  {name}
                </label>

                {(type === "text" || type === "number") && (
                  <input
                    name={name}
                    type={type}
                    value={formData[name] as string | number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-b border-gray-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
                  />
                )}

                {type === "checkbox" && (
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name] as boolean}
                    onChange={handleChange}
                    className="mt-2"
                  />
                )}

                {type === "date" && (
                  <input
                    type="date"
                    name={name}
                    min={new Date().toISOString().split("T")[0]}
                    value={
                      (formData[name] as string) ||
                      new Date().toISOString().split("T")[0]
                    }
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border-b border-gray-400 focus:outline-none focus:[var--(primary)] min-h-[44px] cursor-pointer"
                  />
                )}

                {type === "select" && (
                  <Select
                    options={ragioniSoc.map((r) => ({ value: r, label: r }))}
                    value={
                      formData[name]
                        ? { value: formData[name], label: formData[name] }
                        : ragioniSoc.length > 0
                        ? { value: ragioniSoc[0], label: ragioniSoc[0] }
                        : null
                    }
                    onChange={(selectedOption) => {
                      setFormData((prev) => ({
                        ...prev,
                        [name]: selectedOption ? selectedOption.value : "",
                      }));
                    }}
                    className="w-full"
                    classNamePrefix="react-select"
                    isClearable
                    placeholder="Seleziona.."
                  />
                )}
              </div>
            ))}
        </div>

        {fields.find(({ name }) => name === "note") && (
          <div className="mb-4 w-full">
            <label className="block text-xs font-semibold uppercase text-[var(--primary)] mb-1">
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
