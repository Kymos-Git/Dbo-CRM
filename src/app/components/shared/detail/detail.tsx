/**
 * Componente Detail
 *
 * Questo componente si occupa di mostrare una visualizzazione dettagliata e leggibile
 * dei dati ricevuti tramite i campi (fields). È utilizzato per visualizzare informazioni
 * come Cliente, Contatto o Visita in un form non modificabile, con un'interfaccia pulita
 * e reattiva. Gestisce inoltre il blocco dello scroll della pagina quando è visibile e
 * fornisce un meccanismo per navigare verso una pagina correlata (es. contatti associati),
 * con animazioni tramite framer-motion.
 */


"use client";

import {  useAnimation } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Form from "../form/form";
import NoteField from "../Notefield";

type Field = {
  title: string;
  value: string | number;
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

  /**
   * Funzione che costruisce la query con la ragione sociale e naviga
   * verso la pagina dei contatti associati.
   */
  const onNavigate = () => {
    const ragSoc = encodeURIComponent(
      fields.find((f) => f.title === "Rag.Soc.")?.value || ""
    );
    router.push(`/dashboard/contatti?ragSoc=${ragSoc}`);
  };

  /**
   * Effetto collaterale per bloccare lo scroll del body quando il componente è visibile,
   * e ripristinare lo scroll quando non lo è o quando il componente viene smontato.
   */
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

  
  const controls = useAnimation();

  /**
   * Funzione che gestisce l'animazione di scaling del bottone di navigazione,
   * quindi esegue la funzione onNavigate e rimuove il blur dal main.
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

    
      {fields
        .filter(({ title }) => title.toLowerCase() === "note")
        .map(({ title, value }, i) => (
          <div key={`note-${i}`} className="dt-field mb-4 max-h-full">
            <label className="dt-note-label block mb-1 font-semibold">
              {title.toUpperCase()}
            </label>
            <NoteField value={value as string} readonly={true} onChange={()=>{}}/>
          </div>
        ))}
    </Form>
  );
}
