/**
 * AIChatInput.tsx
 * 
 * Questo componente rappresenta un campo di input per chat AI.
 * Fornisce un'interfaccia utente moderna e interattiva con placeholder animati,
 * invio messaggi, suggerimenti (tips) e gestione del focus e dimensionamento dinamico del textarea.
 * Utilizza framer-motion per animazioni e lucide-react per icone.
 */

"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Lightbulb, Send } from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";

const PLACEHOLDERS = [
  "Dammi informazioni sul cliente x",
  "Quando ho la prossima visita?",
  "Qual è il contatto del cliente x",
];

type AIChatInputProps = {
  onSend?: (message: string) => void;
};

const AIChatInput: React.FC<AIChatInputProps> = ({ onSend }) => {
  // Stati locali per placeholder corrente, visibilità, stato input attivo, tips attivi, valore input e dropdown tips
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [tipsActive, setTipsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTipsDropdown, setShowTipsDropdown] = useState(false);

  // Riferimenti DOM per il wrapper principale e la textarea
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Effetto che cicla periodicamente i placeholder solo quando
   * il campo non è attivo e l'input è vuoto.
   * Gestisce la transizione con un effetto fade.
   */
  useEffect(() => {
    if (isActive || inputValue) return;

    const VISIBLE_DUR = 6000; // durata visibilità placeholder
    const TRANS_DUR = 400;    // durata transizione

    let timeoutId: NodeJS.Timeout;

    const cycle = () => {
      setShowPlaceholder(false);
      timeoutId = setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
        timeoutId = setTimeout(cycle, VISIBLE_DUR);
      }, TRANS_DUR);
    };
    cycle();

    // Cleanup al dismount
    return () => clearTimeout(timeoutId);
  }, [isActive, inputValue]);

  /**
   * Effetto che chiude dropdown, placeholder e disattiva input
   * quando si clicca fuori dal wrapper del componente.
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsActive(false);
        setTipsActive(false);
        setShowTipsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Attiva l’input al click sul wrapper
  const handleActivate = () => setIsActive(true);

  /**
   * Inserisce un placeholder nel campo input,
   * attiva l’input e nasconde il dropdown tips.
   */
  const handlePlaceholderClick = (pl: string) => {
    setInputValue(pl);
    setIsActive(true);
    setShowTipsDropdown(false);
  };

  /**
   * Invia il messaggio tramite callback onSend,
   * resetta input, stato attivo e altezza textarea.
   */
  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend?.(inputValue);
    setInputValue("");
    setIsActive(false);
    setTipsActive(false);
    setShowTipsDropdown(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // Variants per animazioni framer-motion del placeholder lettera per lettera
  const placeholderContainerVariants: Variants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  };
  const letterVariants: Variants = {
    initial: { opacity: 0, filter: "blur(12px)", y: 10 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: { duration: 0.25 },
        filter: { duration: 0.4 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
  };

  return (
    <div className="ct-container flex flex-col-reverse w-full max-h-[90%] mx-auto md:max-w-[52vw] bg-transparent">
      <motion.div
        ref={wrapperRef}    
        className="ct-wrapper relative rounded-2xl shadow-md cursor-text select-none md:rounded-[2vh] transition-all duration-300 bg-[var(--bg)]"
        onClick={handleActivate}
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}
      >
        {/* Area input */}
        <div className="ct-inputWrapper w-full px-[4vw] box-border border rounded-2xl border-[#333333b9] md:px-6 pt-[1.5vh] pb-[1vh]">
          <div className="flex items-start gap-[2vw]">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onInput={(e) => {
                  // Adatta dinamicamente altezza textarea al contenuto
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${t.scrollHeight}px`;
                }}
                rows={1}
                className="ct-textarea w-full overflow-y-auto resize-none max-h-[20vh] px-[1.2vh] pl-[3vw] pr-[3vw] py-[1.6vh] border-none outline-none rounded-[3vw] text-[1.8vh] md:text-[2vh] placeholder:text-gray-400 bg-[var(--bg)] text-[var(--text)]"
                onKeyDown={(e) => {
                  // Invio senza shift invia il messaggio
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
             
              {/* Placeholder animato */}
              <div className="ct-placeholder absolute left-[3vw] top-[1.7vh] md:top-[1vh] w-full pointer-events-none overflow-hidden whitespace-nowrap">
                <AnimatePresence mode="wait">
                  {showPlaceholder && !isActive && !inputValue && (
                    <motion.span
                      variants={placeholderContainerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="text-gray-400 font-normal inline-block text-[1.9vh] md:text-[2.5vh]"
                    >
                      {PLACEHOLDERS[placeholderIndex].split("").map((char, i) => (
                        <motion.span key={i} variants={letterVariants} className="inline-block">
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottone invio */}
            <button
              className="ct-button-icon border-gray-400 cursor-pointer bg-opacity-85 rounded-full flex justify-center items-center p-[1.2vh] mt-[0.5vh] md:w-[5vw] md:hover:scale-110 text-[var(--text)] bg-[var(--bg-alt)]"
              title="Send"
              type="button"
              tabIndex={-1}
              onClick={handleSend}
            >
              <Send size={18} />
            </button>
          </div>

          {/* Wrapper suggerimenti (tips) con animazione */}
          <motion.div
            className="ct-tipsWrapper mt-[1vh] flex justify-start"
            variants={{
              hidden: { opacity: 0, y: 20, pointerEvents: "none" },
              visible: { opacity: 1, y: 0, pointerEvents: "auto" },
            }}
            initial="hidden"
            animate={isActive || inputValue || tipsActive || showTipsDropdown ? "visible" : "hidden"}
          >
            <div className="flex gap-[3vw] relative md:gap-2">
             
              {/* Dropdown tips */}
              {showTipsDropdown && (
                <motion.ul
                  className="ct-dropdown bg-bg absolute bottom-full mb-[1vh] left-0 rounded-[1vh] p-[0.6vh_0] min-w-[70vw] max-h-[25vh] overflow-y-auto z-50 md:min-w-[20vw] bg-[var(--bg-alt)] text-[var(--text)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  {PLACEHOLDERS.map((tip, idx) => (
                    <li
                      key={idx}
                      className="ct-dropdown-item px-[3vw] py-[1vh] text-[1.6vh] cursor-pointer md:w-full md:pl-5 hover:bg-[var(--bg)] hover:text-[var(--primary)] transition duration-300 ease-in-out"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceholderClick(tip);
                      }}
                    >
                      {tip}
                    </li>
                  ))}
                </motion.ul>
              )}
            
              {/* Bottone per attivare/disattivare tips */}
              {isActive && (
                <button
                  className={`ct-button-secondary flex items-center gap-[2vw] px-[3vw] py-[0.8vh] rounded-full font-semibold text-[1.4vh] transition-colors cursor-pointer ${
                    tipsActive ? "outline-[0.3vh]" : "hover:bg-gray-200 hover:text-black"
                  }`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTipsActive((v) => !v);
                    setShowTipsDropdown((v) => !v);
                  }}
                >
                  <Lightbulb
                    size={18}
                    className={`${tipsActive ? "fill-yellow-400" : "fill-none"} transition duration-200`}
                  />
                  <span>Tips</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIChatInput;
