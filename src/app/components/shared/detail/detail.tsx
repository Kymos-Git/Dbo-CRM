"use client";

import { motion, AnimatePresence } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
};

export default function Detail({
  title,
  fields,
  onClose,
  visible,
  flgCliente,
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className=" cd-zoom-container fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90vw] h-[80vh] overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={onClose}
            className="cl-btn absolute top-4 left-4 transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
            aria-label="Chiudi dettaglio"
          ></button>

          {flgCliente && (
            <button
              onClick={onNavigate}
              className="cl-btnCnt absolute right-4 top-4 rounded-2xl transition text-xs cursor-pointer md:hover:scale-105 w-4 h-4 bg-green-400"
              title="vai ai contatti"
            ></button>
          )}
          <motion.div
            className="cd-zoom relative rounded-xl max-w-4xl w-full h-[90%] overflow-auto p-2 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="dt-title text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8 tracking-wide">
              {title}
            </h3>

            <form
              className="
                dt-form
                grid 
                grid-cols-2
                sm:grid-cols-1
                md:grid-cols-1
                gap-x-2 
                auto-rows-min
              "
            >
              {fields.map(({ title, value, type }, i) => (
                <div
                  key={i}
                  className={`dt-field mb-4 ${
                    ["note", "descrizione"].includes(title.toLowerCase())
                      ? "large-field"
                      : ""
                  }`}
                >
                  <ExpandableInput label={title} value={value} type={type} />
                </div>
              ))}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
