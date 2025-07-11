"use client";

import { motion, AnimatePresence } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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

  useEffect(()=>{

  },[])



  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className=" dt-container fixed inset-0 flex flex-row flex-wrap backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl md:pt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="dt-header relative flex items-center justify-between h-15 w-full mb-5">
            <div className="flex items-center space-x-2 w-10">
              <button
                onClick={onClose}
                className="dt-close transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
                aria-label="Chiudi dettaglio"
              ></button>

              {flgCliente && (
                <button
                  onClick={() => {
                    onNavigate();
                    document.getElementsByTagName("main")[0].style.filter =
                      "blur(0px)";
                  }}
                  className="dt-cnt absolute left-10 md:left-5 top-5.3 rounded-2xl transition cursor-pointer md:hover:scale-105 w-4 h-4 bg-green-400 "
                  title="vai ai contatti"
                ></button>
              )}
            </div>

            <p className="  text-center text-xs font-bold tracking-wide">
              {title}
            </p>

            <div className="dt-semaphore flex items-center space-x-1 ml-2">
              {colors.map((c, i) => (
                <button
                  key={i}
                  className="rounded-2xl transition w-3 h-3"
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="dt-main relative rounded-xl max-w-4xl w-full h-[85%] overflow-auto p-2 pt-0 md:w-full md:max-w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form
              className="
                dt-form
                grid 
                grid-cols-2
                sm:grid-cols-1
                md:grid-cols-3
                gap-x-2 
                auto-rows-min
              "
            >
              {fields
                .filter(({ title }) => title.toLowerCase() !== "note")
                .map(({ title, value, type }, i) => (
                  <div key={i} className="dt-field mb-4">
                    <ExpandableInput label={title} value={value} type={type} />
                  </div>
                ))}

             
            </form>
              {/* Campo Note alla fine come semplice textarea */}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
