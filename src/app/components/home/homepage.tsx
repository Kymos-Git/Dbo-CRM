/**
 * Homepage.tsx
 * 
 * Questo componente rappresenta la pagina principale di una chat AI simulata.
 * Gestisce lo stato dei messaggi scambiati tra utente e AI, visualizzandoli in ordine cronologico.
 * Contiene la logica per inviare messaggi utente e simulare risposte AI.
 */

import { useEffect, useRef, useState } from "react";
import AIChatInput from "./chatinput";


// Definizione del tipo Message per i messaggi di chat
type Message = {
  id: number;             // Identificativo univoco del messaggio
  text: string;           // Testo del messaggio
  sender: "user" | "ai";  // Chi ha inviato il messaggio: utente o AI
};

export default function Homepage() {
  // Stato booleano che indica se l’utente ha inviato almeno un messaggio
  const [hasSentMessage, setHasSentMessage] = useState(false);

  // Stato che mantiene la lista di tutti i messaggi scambiati
  const [messages, setMessages] = useState<Message[]>([]);

  // Contatore per generare ID unici progressivi per i messaggi
  const [nextId, setNextId] = useState(0);

  // Riferimento al div in fondo alla lista messaggi, usato per scroll automatico
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /**
   * Effetto che si attiva ad ogni cambiamento di `messages`
   * Fa scrollare automaticamente la lista messaggi verso il basso
   * per mostrare l’ultimo messaggio inviato o ricevuto.
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Funzione chiamata quando l’utente invia un nuovo messaggio.
   * Aggiunge subito il messaggio utente alla lista, poi simula
   * una risposta AI dopo un ritardo di 1500ms.
   * 
   * @param msg - testo del messaggio inviato dall’utente
   */
  const handleMessage = (msg: string) => {
    setHasSentMessage(true);

    // Definisce due ID consecutivi: uno per l’utente e uno per la risposta AI
    const userId = nextId;
    const aiId = nextId + 1;

    // Aggiunge il messaggio utente alla lista messaggi
    setMessages((prev) => [...prev, { id: userId, text: msg, sender: "user" }]);

    // Aggiorna il prossimo ID disponibile (incrementa di 2)
    setNextId(aiId + 1);

    // Simula la risposta AI con un delay di 1500ms
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: aiId, text: "Risposta AI simulata a: " + msg, sender: "ai" },
      ]);
    }, 1500);
  };

  return (
    <div className="hm-container w-full relative h-full bg-[var(--bg)]">
      
      {/* Area visualizzazione messaggi */}
      <div className="hm-messages flex-1 overflow-y-auto pt-8 pl-10 pr-6 text-center max-h-[80%] bg-[var(--bg)]">
        {!hasSentMessage ? (
          // Messaggio di benvenuto se non è stato inviato alcun messaggio
          <p className="hm-welcome text-lg h-[100%] w-[80%] flex items-end justify-center absolute bottom-[60%] md:text-4xl md:bottom-[65%] md:w-[90%]">
            Ciao come posso aiutarti?
          </p>
        ) : (
          // Mappa l’array dei messaggi per mostrarli uno ad uno
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full mb-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl max-w-[75%] break-words whitespace-pre-wrap shadow-md
                  ${
                    msg.sender === "user"
                      ? "hm-user-msg rounded-br-none bg-[var(--primary)] text-[var(--bg)]"
                      : "hm-ai-msg rounded-bl-none bg-[var(--bg-alt)] text-[var(--text)]"
                  }`}
              >
                {/* Tag per indicare chi ha scritto il messaggio */}
                <span className="hm-user-tag text-xs font-semibold absolute -top-4 left-2 opacity-70">
                  {msg.sender === "user" ? "Tu" : "AI"}
                </span>

                {/* Testo del messaggio */}
                <span>{msg.text}</span>
              </div>
            </div>
          ))
        )}
        {/* Div invisibile usato come ancora per lo scroll automatico */}
        <div ref={bottomRef} />
      </div>

      {/* Wrapper input messaggi */}
      <div
        className={`hm-input-wrapper absolute h-[20%] max-h-[18%] w-full mt-5 ${
          hasSentMessage ? "bottom-[0]" : "bottom-[40%]"
        }`}
      >
        {/* Componente input per inviare messaggi */}
        <AIChatInput onSend={handleMessage} />
      </div>
    </div>
  );
}
