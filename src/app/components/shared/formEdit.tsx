"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";

import {
  getClienti,
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
import { Cliente } from "@/app/interfaces/interfaces";

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

  const schemaKeyMap = Object.keys(schema.shape).reduce((acc, key) => {
    acc[normalize(key)] = key;
    return acc;
  }, {} as Record<string, string>);

  const getSchemaKey = (title: string): string =>
    schemaKeyMap[normalize(title)] || title;

  const initialState: Record<string, string | number> = Object.fromEntries(
    fields.map((f) => [getSchemaKey(f.title), f.value ?? ""])
  );

  const [formState, setFormState] = useState(initialState);
  const [clienti, setClientiList] = useState<Cliente[]>([]);
  const [ragioniSoc, setRagioniList] = useState<string[]>([]);

  useEffect(() => {
    if (type === "visita" || type === "contatto") {
      getRagSoc();
    }
  }, [type]);

  const getRagSoc = async () => {
    try {
      const clienti = await getClienti(fetchWithAuth);
      const r: string[] = clienti.map((c) => c.RagSocCompleta);
      setClientiList(clienti);
      setRagioniList(r);
    } catch (err) {
      console.error(err);
      toast.error("Errore durante il caricamento dei clienti");
    }
    
  };

  const handleChange = (title: string, value: string | number) => {
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
          await UpdateCliente(fetchWithAuth, { IdCliente: id, ...transformed });
          break;
        case "contatto":
          await UpdateContatto(fetchWithAuth, {
            IdContatto: id,
            ...transformed,
          });
          break;
        case "visita":
          await UpdateVisita(fetchWithAuth, {
            IdAttivita: id,
            ...transformed,
          });
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

          if (type!=='cliente' &&field.title.toLowerCase()==='ragsoc') {
            return (
              <label
                key={field.title}
                className="frm-modal-label mb-4 text-xs tracking-widest uppercase block text-[var(--primary)]"
              >
                {field.title}
                <Select
                  options={ragioniSoc.map((r) => ({ value: r, label: r }))}
                  value={
                    formState[key]
                      ? { value: formState[key], label: formState[key] }
                      : null
                  }
                  onChange={(selectedOption) => {
                    handleChange(
                      field.title,
                      selectedOption ? selectedOption.value : ""
                    );
                  }}
                  className="w-full"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder="Seleziona.."
                />
              </label>
            );
          }

          return (
            <label
              key={field.title}
              className="frm-modal-label mb-4 text-xs tracking-widest uppercase block text-[var(--primary)]"
            >
              {field.title}
              <input
                type={field.type}
                value={formState[key] || ""}
                onChange={(e) =>
                  handleChange(field.title, e.target.value)
                }
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
