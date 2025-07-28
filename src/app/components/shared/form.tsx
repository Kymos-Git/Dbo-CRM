/**
 * Form
 * 
 * Componente modale che gestisce la visualizzazione di un form popup.
 * Usa React Portals per rendere il contenuto fuori dal normale flusso DOM, sovrapponendolo a tutto il resto.
 * Integra animazioni di apertura/chiusura con framer-motion.
 * Supporta la visualizzazione di un header con titolo, bottoni di chiusura, pulsanti di azione opzionali e indicatori colore.
 * Può includere una funzione di navigazione legata a un flag cliente.
 * Gestisce internamente il montaggio per evitare rendering prematuri sul server.
 * Gestisce automaticamente gli z-index per portare in primo piano l'ultima scheda cliccata.
 */
"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { usePinch } from "@use-gesture/react";
import { useZIndex } from "@/app/hooks/formHook";


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
  onFocus?: () => void;
  formId: string; // Nuovo prop obbligatorio per identificare univocamente ogni form
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
  onReset,
  onFocus,
  formId, // Nuovo prop
}: FormProps) {
  const controls = useAnimation();
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Usa il nuovo hook per gestire gli z-index
  const { zIndex, bringToFront, removeFromStack } = useZIndex(formId);

  // Aggiorna dimensione finestra
  useEffect(() => {
    function onResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cleanup quando il form viene chiuso o smontato
  useEffect(() => {
    if (!visible) {
      removeFromStack();
    }
    return () => {
      removeFromStack();
    };
  }, [visible, removeFromStack]);

  // Init dimensioni e posizione con priorità ai props forzati
  const initWidth = isMobile
    ?  windowSize.width * 0.9
    : windowSize.width *0.75;
    
  const initHeight = isMobile
    ?  windowSize.height * 0.8
    :  windowSize.height *0.7;

  const initX = isMobile
    ? windowSize.width * 0.05
    : windowSize.width *0.12;
    
  const initY = isMobile
    ?  windowSize.height * 0.1
    :  windowSize.height *0.1;

  const [size, setSize] = useState({ width: initWidth, height: initHeight });
  const [position, setPosition] = useState({ x: initX, y: initY });

  // Per toggle fullscreen e ripristino
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedSize, setSavedSize] = useState<{ width: number; height: number } | null>(null);
  const [savedPosition, setSavedPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quando cambia la finestra, aggiorna dimensioni e posizione se NON fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setSize({ width: initWidth, height: initHeight });
      setPosition({ x: initX, y: initY });
    }
  }, [windowSize.width, windowSize.height, isFullscreen]);

  // Gestione pinch per mobile
  const bind = usePinch(
  (state) => {
    const { last, offset } = state;
    const scale = offset[1];
    if (isMobile && last && scale > 1.2) {
      toggleFullscreen();
    }
  },
  {
    scaleBounds: { min: 0.5, max: 3 },
    rubberband: true,
  }
);

  if (!mounted) return null;
  if (!visible) return null;

  function toggleFullscreen() {
    if (!isFullscreen) {
      setSavedSize(size);
      setSavedPosition(position);
      setIsFullscreen(true);
    } else {
      if (savedSize) setSize(savedSize);
      if (savedPosition) setPosition(savedPosition);
      setIsFullscreen(false);
    }
  }

  function handleFocus() {
    // Porta questo form in primo piano
    bringToFront();
    if (onFocus) onFocus();
  }

  const fullscreenSize = isMobile
    ? {
        width: windowSize.width - 16,
        height: windowSize.height - 80,
      }
    : { width: "98vw", height: "96vh"};

  const fullscreenPosition = isMobile ? { x: 8, y: 40 } : { x: 20, y:20 };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <Rnd
         dragHandleClassName="frm-header"
          size={isFullscreen ? fullscreenSize : size}
          position={isFullscreen ? fullscreenPosition : position}
          minWidth={300}
          minHeight={200}
          bounds="window"
          enableResizing={!isFullscreen}
          disableDragging={isFullscreen}
          onDragStart={handleFocus}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            setSize({
              width: ref.style.width ? parseInt(ref.style.width) : size.width,
              height: ref.style.height ? parseInt(ref.style.height) : size.height,
            });
            setPosition(position);
          }}
          style={{
            zIndex, // Usa il zIndex dinamico
            borderRadius: 16,
            border: "1px solid var(--primary)",
            backgroundColor: "var(--bg)",
            overflow: "hidden",
          }}
          className="frm-container p-2"
            {...(isMobile ? bind() as any : {})}
        >
          <motion.div
            className="frm-header relative flex items-center justify-between h-12 mb-5 w-[95%] md:w-full select-none px-4"
            style={{ 
              cursor: isFullscreen ? "default" : "move",
              touchAction: "none" 
            }}
            onDoubleClick={!isMobile ? toggleFullscreen : undefined}
            onMouseDown={!isMobile ? handleFocus : undefined}
            onTouchStart={isMobile ? handleFocus : undefined}
          >
            <div className="flex items-center space-x-2" style={{ minWidth: 48 }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="frm-close transition font-bold rounded-2xl cursor-pointer bg-red-600 w-4 h-4 z-50"
                style={{ 
                  touchAction: "manipulation",
                  pointerEvents: "auto"
                }}
                aria-label="Chiudi form"
              />

              {flgCliente && onNavigate && (
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate();
                  }}
                  className="frm-cnt absolute left-10 md:left-10 top-5.3 rounded-2xl transition cursor-pointer md:hover:scale-105 w-4 h-4 bg-green-400"
                  style={{ 
                    touchAction: "manipulation",
                    pointerEvents: "auto"
                  }}
                  title="Vai ai contatti"
                  animate={controls}
                />
              )}
            </div>

            <p className="text-center text-xs font-bold tracking-wide pointer-events-none">
              {title}
            </p>

            {!fglButtons ? (
              <div className="frm-semaphore flex items-center space-x-1 ml-2">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    className="rounded-2xl transition w-3 h-3"
                    style={{ 
                      backgroundColor: c,
                      touchAction: "manipulation",
                      pointerEvents: "auto"
                    }}
                    
                  />
                ))}
              </div>
            ) : (
              <div className="frmAdd-buttons flex items-center space-x-2 ml-2 z-50 w-40">
                <button
                  className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFocus(); // Porta in primo piano quando si clicca
                    onSend?.();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFocus();
                    onSend?.();
                  }}
                  style={{ 
                    touchAction: "manipulation",
                    pointerEvents: "auto"
                  }}
                  name="invia"
                  type="button"
                >
                  {buttons[0]}
                </button>

                <button
                  className="rounded-2xl transition w-17 h-9 cursor-pointer border-1 border-[var(--primary)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFocus(); // Porta in primo piano quando si clicca
                    onReset?.();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFocus();
                    onReset?.();
                  }}
                  style={{ 
                    touchAction: "manipulation",
                    pointerEvents: "auto"
                  }}
                  name="reset"
                  type="button"
                >     
                  {buttons[1]}
                </button>
              </div>
            )}

            {/* Indicatore pinch per mobile */}
            {isMobile && (
              <div className="absolute top-1 right-1 text-xs opacity-50 pointer-events-none">
                📏
              </div>
            )}
          </motion.div>

          <motion.div
            className="frm-main relative rounded-xl max-w-4xl w-full h-[85%] p-2 pt-0 md:w-full md:max-w-full overflow-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleFocus(); // Porta in primo piano quando si clicca nel contenuto
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
                  touchAction: "manipulation",
                  pointerEvents: "auto"
                }}
          >
            {children}
          </motion.div>
        </Rnd>
      )}
    </AnimatePresence>,
    document.body
  );
}