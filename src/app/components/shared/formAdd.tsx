
/**
 * Componente FormAdd permette di creare un form dinamico per
 * l'inserimento di "cliente", "contatto" o "visita".
 * Gestisce validazione dati, caricamento clienti, invio e reset form.
 */

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

/**
 * Genera un array di campi a partire dallo schema Zod,
 * mappando i tipi Zod in tipi HTML input adeguati.
 */
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

/**
 * Seleziona lo schema e i relativi campi generati in base al tipo di form.
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
  // Stato per schema, campi form e dati inseriti
  const [schema, setSchema] = useState<ZodObject<ZodRawShape> | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean>
  >({});
  const router = useRouter();

  // Stato per lista clienti e ragioni sociali (per select)
  const [clienti, setClientiList] = useState<Cliente[]>([]);
  const [ragioniSoc, setRagioniList] = useState<string[]>([]);

  const { fetchWithAuth, username } = useAuth();

  /**
   * Carica lista clienti dal backend e ne estrae le ragioni sociali
   * per popolare il campo select.
   */
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

  // Effetto che aggiorna schema, campi e dati iniziali ogni volta che cambia il tipo di form
  useEffect(() => {
    const { schema: selectedSchema, fields: generatedFields } =
      getSchemaAndFields(type);

    // Per il tipo "cliente" convertiamo campi select in text per uniformità
    let modifiedFields = generatedFields;
    if (type === "cliente") {
      modifiedFields = generatedFields.map((field) =>
        field.type === "select" ? { ...field, type: "text" } : field
      );
    }

    // Per "visita" e "contatto" carichiamo le ragioni sociali da backend
    if (type === "visita" || type === "contatto") {
      getRagSoc();
    }

    // Inizializziamo dati del form con valori di default (false per checkbox, oggi per date, stringa vuota altrove)
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

  /**
   * Se la lista ragioni sociali è caricata,
   * imposta di default la prima come valore di RagSoc.
   */
  useEffect(() => {
    if ((type === "visita" || type === "contatto") && ragioniSoc.length > 0) {
      setFormData((prev) => ({
        ...prev,
        RagSoc: prev.RagSoc || ragioniSoc[0],
      }));
    }
  }, [ragioniSoc, type]);

  /**
   * Gestore generico delle modifiche nei campi del form.
   * Converte correttamente checkbox e number.
   */
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

  /**
   * Specifico handler per il campo note.
   */
  const handleNoteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, note: value }));
  };

  /**
   * Trasforma le chiavi degli oggetti rimuovendo underscore
   * per adeguare i nomi ai campi del backend.
   */
  const transformKeys = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      const newKey = key.replace(/_/g, "");
      newObj[newKey] = obj[key];
    }
    return newObj;
  };

  /**
   * Funzione per inviare i dati al backend.
   * Valida dati con schema Zod, gestisce casi speciali per visita,
   * mostra notifiche e resetta il form.
   */
  const sendData = async () => {
    if (!schema) return;

    try {
      const parsed = schema.parse(formData);
      const transformed = transformKeys(parsed);

      // Per visite, sostituisce RagSoc con IdCliente
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

      // Invio dati secondo tipo
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

      // Forza reload pagina aggiungendo query param e chiude form
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

  /**
   * Reset dei campi del form a valori iniziali (false per checkbox, vuoto altrove).
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
