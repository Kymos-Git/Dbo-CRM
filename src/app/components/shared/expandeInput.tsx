/**
 * ExpandableInput.tsx
 *
 * Componente per mostrare un input o textarea che inizialmente è "compresso" (readonly).
 * Al click o focus, si apre un modal con l'input espanso per una visualizzazione più comoda.
 * Supporta la copia del valore per alcuni tipi di campi (Telefono, Email, Cellulare).
 * Gestisce l'altezza dinamica del textarea per adattarsi al contenuto.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";

interface ExpandableInputProps {
  label: string; 
  value: string|number; 
  type?: string;
}

const ExpandableInput = ({
  label,
  value,
  type = "text",
}: ExpandableInputProps) => {
  // Stato che indica se il modal espanso è aperto o chiuso
  const [isOpen, setIsOpen] = useState(false);

  // Stato per memorizzare l'altezza dinamica del textarea espanso
  const [textareaHeight, setTextareaHeight] = useState<number | undefined>(
    undefined
  ); 

  // Ref al textarea per calcolare l'altezza del contenuto
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * useEffect che aggiorna l'altezza del textarea ogni volta che il modal si apre
   * o cambia il valore, per adattarsi dinamicamente al contenuto.
   */
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto"; 
      el.style.height = el.scrollHeight + "px";
      setTextareaHeight(el.scrollHeight)
    }
  }, [isOpen, value]);

  /**
   * Funzione chiamata all'input del textarea per aggiornare l'altezza
   * del campo in base al contenuto digitato, mantenendo il resize automatico.
   */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    setTextareaHeight(el.scrollHeight);
  };

  /**
   * Funzione che copia il valore del campo negli appunti,
   * mostrando alert di conferma o errore.
   */
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(value as string);
      alert("Copiato negli appunti!");
    } catch (err) {
      alert("Errore nella copia: " + err);
    }
  };

  return (
    <>
      {/* Input compresso, cliccabile per aprire il modal */}
      <div
        className="ex-wrapper cursor-pointer"
        onClick={() => setIsOpen(true)} 
        title="Clicca per espandere"
      >
        <label
          htmlFor={label}
          className="ex-label text-m sm:text-sm md:text-sm font-semibold uppercase tracking-widest text-[var(--primary)] border-[var(--primary)]"
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
            truncate min-h-[44px] border-t-0 border-l-0 border-b-1 border-r-0 border-gray-400 bg-[var(--bg)] text-[var(--text)]"
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Modal espanso con animazioni di apertura e chiusura */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="ex-backdrop fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)} 
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} 
              //border-[1px] border-[var(--primary)]
              className="ex-modal w-[90%] rounded-lg p-4 max-w-4xl  bg-[var(--bg)] shadow-[0_1px_6px_var(--text)]"
              style={{ height: textareaHeight ? textareaHeight + 110 : "auto" }}  
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              <label
                htmlFor={`${label}-expanded`}
                className="ex-modal-label mb-4 text-m sm:text-sm md:text-sm font-semibold uppercase tracking-widest text-[var(--primary)]"
              >
                {label}
              </label>

              {/* Se il tipo è text, mostra un textarea espandibile, altrimenti un input */}
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
                    min-h-[44px] resize-none overflow-hidden mt-4 mb-2 bg-[var(--bg)] text-[var(--text)] border-b-1 border-b-[var(--bg-alt)]"
                  onBlur={() => setIsOpen(false)} 
                  rows={1}
                />
              ) : (
                <input
                  id={`${label}-expanded`}
                  type={type}
                  readOnly
                  defaultValue={value}
                  className="ex-expanded-input
                    w-full  px-3 py-2
                    text-sm sm:text-base placeholder:text-[#a1cde8]
                    focus:outline-none transition-shadow
                    min-h-[44px] border-b-1 border-b-[var(--primary)]"
                  onBlur={() => setIsOpen(false)}
                />
              )}

              {/* Icona copia per alcuni label specifici */}
              {(label === "TELEFONO" ||
                label === "EMAIL" ||
                label === "CELLULARE") && (
                <span
                  className="ex-copy cursor-pointer text-[var(--text)]"
                  onClick={copyText}
                  title="Copia"
                >
                  <Copy className="es-copy w-5 h-5 transition mt-2" />
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
