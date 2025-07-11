/**
 * ExpandableInput.tsx
 *
 * Componente per mostrare un input o textarea che inizialmente è "compresso" (readonly).
 * Al click o focus, si apre un modal con l'input espanso per una visualizzazione più comoda.
 *
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./expandeInput.css";
import { Copy } from "lucide-react";

interface ExpandableInputProps {
  label: string; // Etichetta del campo
  value: string; // Valore da mostrare
  type?: string; // Tipo input (default: "text")
}

const ExpandableInput = ({
  label,
  value,
  type = "text",
}: ExpandableInputProps) => {
  const [isOpen, setIsOpen] = useState(false); // Stato per apertura/chiusura modal
  const [textareaHeight, setTextareaHeight] = useState<number | undefined>(
    undefined
  ); // Altezza textarea dinamica
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quando il modal si apre, calcola e imposta altezza textarea basata sul contenuto
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto"; // reset altezza
      el.style.height = el.scrollHeight + "px"; // aggiorna all’altezza contenuto
      setTextareaHeight(el.scrollHeight); // salva altezza in stato
    }
  }, [isOpen, value]);

  // Aggiorna altezza textarea quando l’utente digita (solo per textarea)
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    setTextareaHeight(el.scrollHeight);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Copiato negli appunti!");
    } catch (err) {
      alert("Errore nella copia: " + err);
    }
  };

  return (
    <>
      {/* Campo compresso: label + input readonly */}
      <div
        className="ex-wrapper cursor-pointer"
        onClick={() => setIsOpen(true)} // apre modal al click
        title="Clicca per espandere"
      >
        <label
          htmlFor={label}
          className="ex-label text-m sm:text-sm md:text-sm font-semibold text-[#1077bc] uppercase tracking-widest "
        >
          {label}
        </label>
        <input
          id={label}
          type={type}
          value={value}
          readOnly
          className="ex-input
            w-full px-1
            text-sm sm:text-base
            focus:outline-none 
            cursor-pointer select-text
            truncate min-h-[44px] border-t-0 border-l-0 border-b-1 border-r-0 border-gray-400"
          onFocus={() => setIsOpen(true)} // apre modal al focus
        />
      </div>

      {/* Modal con animazioni di apertura/chiusura */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="ex-backdrop fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)} // chiude modal cliccando fuori
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // impedisce chiusura cliccando dentro modal
              className="ex-modal w-[90%] rounded-lg p-4 max-w-4xl shadow-lg"
              style={{ height: textareaHeight ? textareaHeight + 110 : "auto" }} // altezza dinamica
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              <label
                htmlFor={`${label}-expanded`}
                className="ex-modal-label mb-4 text-m sm:text-sm md:text-sm font-semibold uppercase tracking-widest"
              >
                {label}
              </label>

              {/* Se tipo è text, mostra textarea espandibile */}
              {type === "text" ? (
                <textarea
                  id={`${label}-expanded`}
                  ref={textareaRef}
                  readOnly
                  defaultValue={value}
                  onInput={handleInput}
                  className="ex-textarea
                    w-full px-3 py-2
                    text-s sm:text-base
                    focus:outline-none
                    min-h-[44px] resize-none overflow-hidden mt-4 mb-2"
                  onBlur={() => setIsOpen(false)} // chiude modal perdendo focus
                  rows={1}
                />
              ) : (
                // Per altri tipi, usa input espanso readonly
                <input
                  id={`${label}-expanded`}
                  type={type}
                  readOnly
                  defaultValue={value}
                  className="ex-expanded-input
                    w-full border rounded-lg px-3 py-2
                    text-sm sm:text-base placeholder:text-[#a1cde8]
                    focus:outline-none transition-shadow shadow-md
                    min-h-[44px]"
                  onBlur={() => setIsOpen(false)}
                />
              )}
              {(label === "Telefono" ||
                label === "Email" ||
                label === "Cellulare") && (
                <span
                  className="ex-copy cursor-pointer"
                  onClick={copyText}
                  title="Copia"
                >
                  <Copy className="es-copy w-5 h-5 transition" />
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpandableInput;
