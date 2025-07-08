/**
 * Homepage.tsx
 * 
 * Questo componente rappresenta la pagina principale di una chat AI simulata.
 * Gestisce lo stato dei messaggi scambiati tra utente e AI, visualizzandoli in ordine cronologico.

 */

import { useEffect, useRef, useState } from "react";
import AIChatInput from "../chatInput/chatinput";
import "./homepage.css";

// Tipo TypeScript per rappresentare un messaggio
type Message = {
  id: number; // id unico del messaggio
  text: string; // testo del messaggio
  sender: "user" | "ai"; // mittente, utente o AI
};

export default function Homepage() {
  // Stato per sapere se è stato inviato almeno un messaggio dall’utente
  const [hasSentMessage, setHasSentMessage] = useState(false);

  // Array di messaggi scambiati tra utente e AI
  const [messages, setMessages] = useState<Message[]>([]);

  // Contatore ID incrementale per creare id unici dei messaggi
  const [nextId, setNextId] = useState(0);

  // Riferimento al div che sta in fondo alla lista messaggi,
  // usato per scroll automatico quando arrivano nuovi messaggi
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Effetto che fa scrollare in basso automaticamente ogni volta che
  // cambia la lista dei messaggi (arriva un nuovo messaggio)
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  
  // Funzione che viene chiamata quando l’utente invia un messaggio
  const handleMessage = (msg: string) => {
    setHasSentMessage(true);

    // Preparo due ID: uno per il messaggio utente, uno per la risposta AI
    const userId = nextId;
    const aiId = nextId + 1;

    // Aggiungo immediatamente il messaggio dell’utente alla lista
    setMessages((prev) => [...prev, { id: userId, text: msg, sender: "user" }]);

    // Aggiorno nextId per i prossimi messaggi (due in più: user + AI)
    setNextId(aiId + 1);

    // Simulo la risposta AI con un ritardo di 1500ms
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: aiId, text: "Risposta AI simulata a: " + msg, sender: "ai" },
      ]);
    }, 1500);
  };

  


  return (
    <div className={` hm-container w-full relative h-full` } >
      {/* Contenitore messaggi con altezza dinamica a seconda se l’utente ha inviato messaggi */}
      <div
        className={` hm-messages flex-1 overflow-y-auto pt-8 pl-10 pr-6 text-center max-h-[80%]`}
      >
        {!hasSentMessage ? (
          // Messaggio di benvenuto visibile solo se non è stato inviato nessun messaggio
          <p className="hm-welcome text-lg h-[100%] w-[80%] flex items-end justify-center  absolute bottom-[60%] md:text-4xl md:bottom-[65%] md:w-[90%]">
            Ciao come posso aiutarti?
          </p>
        ) : (
          // Rendering della lista dei messaggi, differenziati per mittente
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
                      ? "hm-user-msg rounded-br-none"
                      : "hm-ai-msg rounded-bl-none"
                  }`}
              >
                {/* Tag per indicare chi ha inviato il messaggio */}
                <span className="hm-user-tag text-xs font-semibold absolute -top-4 left-2 opacity-70">
                  {msg.sender === "user" ? "Tu" : "AI"}
                </span>
                {/* Testo del messaggio */}
                <span>{msg.text}</span>
              </div>
            </div>
          ))
        )}
        {/* Div vuoto di riferimento per lo scroll automatico */}
        <div ref={bottomRef} />
      </div>

      {/* Wrapper dell’input, posizione relativa variabile */}
      <div
        className={`hm-input-wrapper absolute h-[20%] max-h-[18%] w-full mt-5 ${hasSentMessage?'bottom-[0]':'bottom-[40%]'}`}
      >
        {/* Componente input chat, passa handleMessage come callback onSend */}
        <AIChatInput onSend={handleMessage} />
      </div>
    </div>
  );
}
