"use client";
import { useEffect, useRef } from "react";

type NoteFieldProps = {
  value: string | number | boolean;
  onChange: (value: string) => void;
  readonly?: boolean;
};

function NoteField({ value, onChange, readonly = false }: NoteFieldProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
    onChange(newValue);
  };

  return (
    <textarea
      ref={ref}
      value={String(value ?? "")}
      name="note"
      onChange={handleChange}
      readOnly={readonly}
      className="w-full border-none rounded-xl resize-none min-h-[6rem] focus:outline-none focus:ring-0"
    />
  );
}

export default NoteField;
