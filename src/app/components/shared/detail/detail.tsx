"use client";

import { motion, AnimatePresence } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";

type Field = {
  title: string;
  value: string;
  type: string;
};

type DetailProps = {
  title: string;
  fields: Field[];
  onClose: () => void;
  onNavigate?: () => void;
  visible: boolean;
  flgCliente:boolean;
};

export default function Detail({
  title,
  fields,
  onClose,
  onNavigate,
  visible,
  flgCliente
}: DetailProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="cl-zoom relative rounded-xl max-w-4xl w-full h-[80vh] overflow-auto p-6 sm:p-8 bg-white"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={onClose}
              className="cl-btn absolute top-4 right-4 transition font-bold text-lg rounded cursor-pointer"
              aria-label="Chiudi dettaglio"
            >
              ✕
            </button>
            
            {flgCliente  &&(<button
              onClick={onNavigate}
              className="cl-btnCnt absolute right-12 top-4 rounded-2xl transition h-10 w-28 text-xs cursor-pointer md:hover:scale-105"
            >
              Vai ai contatti
            </button>)}
            

            <h3 className="dt-title text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8 tracking-wide">
              {title}
            </h3>

            <form
              className="
                dt-form
                grid 
                grid-cols-1
                sm:grid-cols-1
                md:grid-cols-
                gap-x-6 
                gap-y-5
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
