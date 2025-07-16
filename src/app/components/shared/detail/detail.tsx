"use client";

import {  useAnimation } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Form from "../form/form";

type Field = {
  title: string;
  value: string;
  type: string;
};

type DetailProps = {
  title: string;
  fields: Field[];
  onClose: () => void;
  visible: boolean;
  flgCliente: boolean;
  colors: string[];
};

export default function Detail({
  title,
  fields,
  onClose,
  visible,
  flgCliente,
  colors,
}: DetailProps) {
  const router = useRouter();

  const onNavigate = () => {
    const ragSoc = encodeURIComponent(
      fields.find((f) => f.title === "Rag.Soc.")?.value || ""
    );
    router.push(`/dashboard/contatti?ragSoc=${ragSoc}`);
  };

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  function NoteField({ value }: { value: string }) {
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (ref.current) {
        ref.current.style.height = "auto"; // reset height
        ref.current.style.height = `${ref.current.scrollHeight}px`; // grow to fit
      }
    }, [value]);
    return (
      <textarea
        ref={ref}
        value={value}
        readOnly
        className="w-full border-none rounded-xl resize-none overflow-hidden min-h-[6rem] focus:outline-none focus:ring-0 "
      />
    );
  }
  const controls = useAnimation();

  const handleNavigation = async () => {
    await controls.start({
      scale: [1, 1.5, 1],
      transition: { duration: 1 },
    });
    onNavigate();
    document.getElementsByTagName("main")[0].style.filter = "blur(0px)";
  };

  return (
    <Form
      visible={visible}
      onClose={onClose}
      title={title}
      flgCliente={flgCliente}
      colors={colors}
      onNavigate={handleNavigation}
      fglButtons={false}
    >
      <form className="dt-form grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-x-2 auto-rows-min">
        {fields
          .filter(({ title }) => title.toLowerCase() !== "note")
          .map(({ title, value, type }, i) => (
            <div key={i} className="dt-field mb-4">
              <ExpandableInput label={title} value={value} type={type} />
            </div>
          ))}
      </form>

      {/* Note Field */}
      {fields
        .filter(({ title }) => title.toLowerCase() === "note")
        .map(({ title, value }, i) => (
          <div key={`note-${i}`} className="dt-field mb-4">
            <label className="dt-note-label block mb-1 font-semibold">
              {title.toUpperCase()}
            </label>
            <NoteField value={value} />
          </div>
        ))}
    </Form>
  );
}
