"use client";

import { motion, AnimatePresence } from "framer-motion";
import ExpandableInput from "../expandedInput/expandeInput";
import "./detail.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className=" cd-zoom-container fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => {
              document.querySelector(".hidden")?.classList.remove("hidden");
              document.getElementsByTagName("main")[0].style.filter =
                "blur(0px)";
              onClose();
            }}
            className="cl-btn absolute top-4 left-4 transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
            aria-label="Chiudi dettaglio"
          ></button>

          {flgCliente && (
            <button
              onClick={() => {
                onNavigate();
                document.getElementsByTagName("main")[0].style.filter =
                  "blur(0px)";
              }}
              className="cl-btnCnt absolute left-9 top-4 rounded-2xl transition cursor-pointer md:hover:scale-105 w-4 h-4 bg-green-400"
              title="vai ai contatti"
            ></button>
          )}

          <div className="semaphore  absolute right-4 top-4 w-50 h-6 flex justify-end">
            {colors.map((c, i) => (
              <button
                className="rounded-2xl transition w-4 h-4 mr-1"
                key={i}
                style={{ backgroundColor: colors[i] }}
              ></button>
            ))}
          </div>

          <motion.div
            className="cd-zoom relative rounded-xl max-w-4xl w-full h-[90%] overflow-auto p-2 pt-0"
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
              {fields
                .filter(({ title }) => title.toLowerCase() !== "note")
                .map(({ title, value, type }, i) => (
                  <div key={i} className="dt-field mb-4">
                    <ExpandableInput label={title} value={value} type={type} />
                  </div>
                ))}

              {/* Campo Note alla fine come semplice textarea */}
              {fields
                .filter(({ title }) => title.toLowerCase() === "note")
                .map(({ title, value }, i) => (
                  <div key={`note-${i}`} className="dt-field mb-4 col-span-2">
                    <label className="dt-note-label block mb-1 font-semibold">{title}</label>
                    <textarea
                      className="dt-note w-full p-2 border rounded-xl resize-none min-h-[6rem] border-none focus:outline-none focus:ring-0 focues:border-none flex h-full"
                      value={value}
                      readOnly
                    />
                  </div>
                ))}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
