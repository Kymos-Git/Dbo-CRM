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
  fglButtons:boolean;
};

export default function Form({
  visible,
  onClose,
  title,
  children,
  colors = [],
  flgCliente = false,
  fglButtons=false,
  onNavigate,
}: FormProps) {
  const controls = useAnimation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className="frm-container fixed inset-0 flex flex-row flex-wrap backdrop-blur-xs z-50 p-4 top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-1/2 w-[90%] h-[80%] overflow-hidden rounded-2xl md:pt-1 bg-[var(--bg)] border-1 border-[var(--primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
        >
          {/* HEADER */}
          <motion.div className={`frm-header relative flex items-center justify-between h-15 mb-5 ${!fglButtons ? 'w-full': 'w-[50%]'}`}>
            <div className="flex items-center space-x-2 w-10">
              <button
                onClick={onClose}
                className="frm-close transition font-bold text-lg rounded-2xl cursor-pointer bg-red-600 w-4 h-4"
                aria-label="Chiudi dettaglio"
              ></button>

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

            <p className="text-center text-xs font-bold tracking-wide">
              {title}
            </p>
            

            {!fglButtons && (<div className="frm-semaphore flex items-center space-x-1 ml-2">
              {colors.map((c, i) => (
                <button
                  key={i}
                  className="rounded-2xl transition w-3 h-3"
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>)}
            
          </motion.div>

          <motion.div
            className="frm-main relative rounded-xl max-w-4xl w-full h-[85%] p-2 pt-0 md:w-full md:max-w-full"
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
