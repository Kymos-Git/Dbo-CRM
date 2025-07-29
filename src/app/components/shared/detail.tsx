/**
 * Componente React "Detail"
 *
 * Mostra una visualizzazione dettagliata in sola lettura di un'entità come Cliente, Contatto o Visita.
 * Blocca lo scroll del body quando è visibile. Permette anche di navigare verso una pagina collegata
 * (es. contatti associati) con animazione. Il contenuto viene suddiviso tra campi semplici e campo note.
 */
"use client";

import { useAnimation } from "framer-motion";
import ExpandableInput from "./expandeInput";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Form from "./form";
import NoteField from "./Notefield";

// Tipo per rappresentare un singolo campo visualizzato nella card
type Field = {
  title: string;
  value: string | number;
  type: string;
};

// Props del componente Detail
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
  const controls = useAnimation();

  /**
   * Naviga verso la pagina dei contatti associati al cliente, utilizzando la Ragione Sociale come query param.
   */
  const onNavigate = () => {
    const ragSoc = encodeURIComponent(
      fields.find((f) => f.title === "RAGSOC")?.value || ""
    );
    router.push(`/dashboard/contatti?ragSoc=${ragSoc}`);
  };

  /**
   * Blocca lo scroll del body quando il dettaglio è visibile.
   * Rimuove il blocco quando non visibile o quando il componente viene smontato.
   */
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  /**
   * Esegue l'animazione del bottone di navigazione, poi reindirizza alla pagina dei contatti.
   */
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
      formId={title}
      title={title}
      flgCliente={flgCliente}
      colors={colors}
      onNavigate={handleNavigation}
      fglButtons={false}
    >
      {/* Campi esclusi "Note" */}
      <form className="dt-form grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-x-2 auto-rows-min">
        {fields
          .filter(({ title }) => title.toLowerCase() !== "note")
          .map(({ title, value, type }, i) => (
            <div key={i} className="dt-field mb-4">
              <ExpandableInput label={title} value={value} type={type} />
            </div>
          ))}
      </form>

      {/* Campo Note separato e non modificabile */}
      {fields
        .filter(({ title }) => title.toLowerCase() === "note")
        .map(({ title, value }, i) => (
          <div key={`note-${i}`} className="dt-field mb-4 max-h-full">
            <label className="dt-note-label block mb-1 font-semibold text-[var(--primary)]">
              {title.toUpperCase()}
            </label>
            <NoteField value={value as string} readonly={true} onChange={() => {}} />
          </div>
        ))}
    </Form>
  );
}
