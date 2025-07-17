"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import Form from "../form/form";

type EditField = {
  key: string;
  title: string;
  value: string;
  type: string;
};

type Props = {
  title: string;
  fields: EditField[];
  onClose: () => void;
  onSave?: (updated: Record<string, string>) => void;
};

export default function FormEdit({ title, fields, onClose, onSave }: Props) {
  const initialState: Record<string, string> = Object.fromEntries(
    fields.map((f) => [f.key, f.value ?? ""])
  );

  const [formState, setFormState] = useState<Record<string, string>>(initialState);

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const sendData = () => {
    if (onSave) {
      onSave(formState);
      toast.success("Modifiche salvate");
    } else {
      toast.info("Nessuna azione definita per il salvataggio");
    }
    onClose();
  };

  const resetFields = () => {
    setFormState(initialState);
    toast.info("Campi ripristinati");
  };

  // Separiamo il campo note dagli altri
  const otherFields = fields.filter((field) => field.key.toLowerCase() !== "note");
  const noteField = fields.find((field) => field.key.toLowerCase() === "note");

  return (
    <Form visible={true} fglButtons={true} title={title} onClose={onClose}>
      <div className="frmEd-buttons flex items-center space-x-2 ml-2 absolute -top-21 -right-5 z-50 w-40 md:-top-18">
        <button
          className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
          onClick={sendData}
          name="invia"
          type="button"
        >
          Salva
        </button>

        <button
          className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
          onClick={resetFields}
          name="reset"
          type="button"
        >
          Annulla
        </button>
      </div>

      {/* Griglia per gli altri campi */}
      <form className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-2 auto-rows-min">
        {otherFields.map((field) => (
          <label
            key={field.key}
            className="frm-modal-label mb-4 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]"
          >
            {field.title}
            <input
              type={field.type}
              value={formState[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full text-sm px-2 focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[44px] text-[var(--text)]"
            />
          </label>
        ))}
      </form>

      {/* Campo note fuori dalla griglia */}
      {noteField && (
        <div className="mt-4 px-1">
          <label className="frm-modal-label mb-1 text-xs font-semibold tracking-widest uppercase block text-[var(--primary)]">
            {noteField.title}
          </label>
          <textarea
            value={formState[noteField.key] || ""}
            onChange={(e) => handleChange(noteField.key, e.target.value)}
            className="w-full px-3 py-2 text-sm focus:outline-none border-b-1 border-b-[var(--grey)] min-h-[100px]"
          />
        </div>
      )}
    </Form>
  );
}
