/**
 * Form
 * 
 * Componente modale che gestisce la visualizzazione di un form popup.
 * Usa React Portals per rendere il contenuto fuori dal normale flusso DOM, sovrapponendolo a tutto il resto.
 * Integra animazioni di apertura/chiusura con framer-motion.
 * Supporta la visualizzazione di un header con titolo, bottoni di chiusura, pulsanti di azione opzionali e indicatori colore.
 * Può includere una funzione di navigazione legata a un flag cliente.
 * Gestisce internamente il montaggio per evitare rendering prematuri sul server.
 */


"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

type FormProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  colors?: string[];
  flgCliente?: boolean;
  onNavigate?: () => void;
  fglButtons: boolean;
  buttons?: string[];
  onSend?: () => void;   
  onReset?: () => void;
};


export default function Form({
  visible,
  onClose,
  title,
  children,
  colors = [],
  flgCliente = false,
  fglButtons = false,
  buttons = [],
  onNavigate,
  onSend,
  onReset
}: FormProps) {
  // Controlli per animazioni tramite framer-motion
  const controls = useAnimation();
  // Stato per verificare che il componente sia montato (client-side only)
  const [mounted, setMounted] = useState(false);

  // Imposta mounted a true solo dopo il primo render (per evitare problemi SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Se non montato, non renderizza nulla (evita problemi server-side)
  if (!mounted) return null;

  // Ritorna il contenuto modale tramite portal sul body del documento
  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className="frm-container fixed inset-0 flex flex-row flex-wrap backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl md:pt-1 bg-[var(--bg)] border-1 border-[var(--primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`frm-header relative flex items-center justify-between h-15 mb-5 w-full`
            }
          >
            <div className="flex items-center space-x-2 w-10">
              {/* Bottone per chiudere il form */}
              <button
                onClick={onClose}
                className="frm-close transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
                aria-label="Chiudi form"
              ></button>

              {/* Pulsante di navigazione visibile solo se flgCliente è attivo e onNavigate fornito */}
              {flgCliente && onNavigate && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate();
                  }}
                  className="frm-cnt absolute left-7 md:left-5 top-5.3 rounded-2xl transition cursor-pointer md:hover:scale-105 w-4 h-4 bg-green-400"
                  title="Vai ai contatti"
                  animate={controls}
                ></motion.button>
              )}
            </div>

            {/* Titolo del form */}
            <p className="text-center text-xs font-bold tracking-wide">
              {title}
            </p>

            {/* Se fglButtons è falso, mostra il semaforo, altrimenti mostra i pulsanti Azione */}
            {!fglButtons ? (
              <div className="frm-semaphore flex items-center space-x-1 ml-2">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    className="rounded-2xl transition w-3 h-3"
                    style={{ backgroundColor: c }}
                  ></button>
                ))}
              </div>
            ) : (
              <div className="frmAdd-buttons flex items-center space-x-2 ml-2  z-50 w-40 ">
                <button
                  className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
                  onClick={onSend}
                  name="invia"
                  type="button"
                >
                  {buttons[0]}
                </button>

                <button
                  className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
                  onClick={onReset}
                  name="reset"
                  type="button"
                >
                  {buttons[1]}
                </button>
              </div>
            )}
          </motion.div>

          {/* Contenuto principale del form, scrollabile e animato */}
          <motion.div
            className="frm-main relative rounded-xl max-w-4xl w-full h-[85%] p-2 pt-0 md:w-full md:max-w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
