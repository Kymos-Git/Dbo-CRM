/**
 * Login.tsx
 *
 * Componente per la pagina di login.
 * Gestisce l'inserimento di username e password, l'autenticazione tramite hook custom useAuth,
 * la gestione dello stato di caricamento, degli errori e il redirect alla dashboard dopo login riuscito.
 */

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LoadingComponent } from "../loading/loading";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import { useTheme } from "next-themes";
import "./login.css";
import { toast } from "react-toastify";

export function Login() {
  // Stato per memorizzare il valore attuale dell'username inserito dall'utente
  const [username, setUsername] = useState("");

  // Stato per memorizzare la password inserita dall'utente
  const [password, setPassword] = useState("");

  // Stato che indica se la richiesta di login è in corso (loading)
  const [loading, setLoading] = useState(false);

  // Stato per memorizzare dinamicamente la sorgente dell'immagine del logo in base al tema attuale
  const [logoSrc, setLogoSrc] = useState("/logo-nero.png");

  // Hook di Next.js per gestire la navigazione (redirect)
  const router = useRouter();

  // Hook custom che espone la funzione di login e lo stato di readiness dell'autenticazione
  const { login, isReady } = useAuth();

  // Hook per accedere al tema attuale (light o dark)
  const { theme } = useTheme();

  /**
   * Effetto che cambia dinamicamente il logo in base al tema (light/dark).
   * Quando cambia il tema, aggiorna `logoSrc` per mostrare il logo appropriato.
   */
  useEffect(() => {
    if (theme === "light") {
      setLogoSrc("/logo-nero.png");
    } else if (theme === "dark") {
      setLogoSrc("/logo-bianco.png");
    }
  }, [theme]);

  /**
   * Funzione chiamata alla sottomissione del form.
   * Si occupa di:
   * - bloccare il comportamento di default del form
   * - avviare lo stato di caricamento
   * - chiamare la funzione login dell’hook useAuth
   * - in caso di successo, resetta i campi e fa redirect a "/dashboard"
   * - in caso di errore, mostra una notifica di errore e termina il caricamento
   *
   * @param e evento di submit del form
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

  
    if (!isReady) {
      return;
    }

    setLoading(true);

    try {
      // Chiamata alla funzione di login con username e password
      await login(username, password);

  
      setUsername("");
      setPassword("");

      // Redirect alla pagina dashboard dopo login riuscito
      router.push("/dashboard");
    } catch (error: unknown) {
      
      const delay = new Promise((resolve) => setTimeout(resolve, 2000));
      await delay;

      // Messaggio di errore di default
      let message = "Errore sconosciuto";

      // Se l’errore è un’istanza di Error, usa il suo messaggio
      if (error instanceof Error) message = error.message;

      // Mostra un toast con l'errore
      toast.error(message);

      // Disattiva lo stato di caricamento
      setLoading(false);
    }
  }

  return (
    <form
      className={`login ${loading ? "loading" : ""}`}
            onSubmit={handleSubmit}  
    >
     
      <Image
        src={logoSrc}
        alt="Logo Kymos"
        width={150}
        height={80}
        style={{ borderRadius: 25 }}
        className="icon"
        priority
      />

      <div className="main">
        {/* Campo input per username */}
        <div className="username">
          <h3>username</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            autoComplete="off"
          />
        </div>

        {/* Campo input per password */}
        <div className="password">
          <h3>password</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Se in caricamento mostra loader, altrimenti bottone di login */}
        {loading ? (
          <div className="loadingComp">
            <LoadingComponent />
          </div>
        ) : (
          <button type="submit" className="btnLogin">
            Login
          </button>
        )}
      </div>
    </form>
  );
}
