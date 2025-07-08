/**
 * Login.tsx
 * 
 * Componente per la pagina di login.
 * Gestisce l'inserimento di username e password, l'autenticazione tramite hook custom useAuth,
 * la gestione dello stato di caricamento, degli errori e il redirect alla dashboard dopo login riuscito.
 * 
 */

"use client";

import styles from "@/app/components/login/login.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoadingComponent } from "../loading/loading";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import { useTheme } from "next-themes";

export function Login() {
  // Stato per username inserito dall’utente
  const [username, setUsername] = useState("");

  // Stato per password inserita dall’utente
  const [password, setPassword] = useState("");

  // Stato per indicare se è in corso il caricamento della richiesta login
  const [loading, setLoading] = useState(false);

  // Stato per salvare eventuali messaggi di errore da mostrare all’utente
  const [errorMsg, setErrorMsg] = useState("");

  // Stato per gestire dinamicamente la sorgente dell’immagine logo in base al tema
  const [logoSrc, setLogoSrc] = useState("/kymos-nero.png");

  // Hook per gestire la navigazione (redirect)
  const router = useRouter();

  // Hook custom per l’autenticazione, espone la funzione login
  const { login,isReady } = useAuth();

  // Hook per gestire il tema corrente (chiaro/scuro)
  const { theme } = useTheme();

  // Effetto che aggiorna il logo in base al tema corrente
  useEffect(() => {
    if (theme === "light") {
      setLogoSrc("/logo-nero.png");
    } else if (theme === "dark") {
      setLogoSrc("/logo-bianco.png");
    }
  }, [theme]);

  // Funzione async che gestisce l’invio del form di login
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Previene il comportamento di submit di default (ricarica pagina)
    if(!isReady){
       setErrorMsg("Configurazione non ancora pronta, riprova.");
    return;
    }
    setLoading(true); // Attiva lo stato di loading
    setErrorMsg(""); // Pulisce eventuali errori precedenti

    try {
      // Chiama la funzione login fornita da useAuth con username e password
      await login(username, password);




      // Resetto i campi input
      setUsername("");
      setPassword("");

      // Redirect alla pagina /dashboard
      router.push("/dashboard");

    } catch (error: unknown) {
      // In caso di errore creo delay di 2 secondi prima di mostrare il messaggio
      const delay = new Promise((resolve) => setTimeout(resolve, 2000));
      await delay;

      // Messaggio di errore di default
      let message = "Errore sconosciuto";

      // Se error è un'istanza di Error, estraggo il messaggio
      if (error instanceof Error) message = error.message;

      // Imposto il messaggio di errore nello stato
      setErrorMsg(message);

      // Mostro alert con messaggio di errore
      alert(message);
    } finally {
      // Disattivo lo stato di loading
      setLoading(false);
    }
  }

  return (
    <form
      className={`${styles.container} ${loading ? styles.loading : ""}`}
      onSubmit={handleSubmit} // Gestisce submit del form
    >
      {/* Logo dinamico in base al tema */}
      <Image
        src={logoSrc}
        alt="Logo Kymos"
        width={150}
        height={80}
        style={{ borderRadius: 25 }}
        className={styles.icon}
        priority
      />
      <h1 className={styles.title}>Login</h1>

      {/* Input username */}
      <div className={styles.username}>
        <h3>username</h3>
        <input
          type="text"
          value={username} // valore controllato dallo stato username
          onChange={(e) => setUsername(e.target.value)} // aggiorna stato onChange
          autoComplete="off"
        />
      </div>

      {/* Input password */}
      <div className={styles.password}>
        <h3>password</h3>
        <input
          type="password"
          value={password} // valore controllato dallo stato password
          onChange={(e) => setPassword(e.target.value)} // aggiorna stato onChange
          autoComplete="off"
        />
      </div>

      {/* Se è in caricamento mostra componente Loading, altrimenti il pulsante submit */}
      {loading ? (
        <div className={styles.loadingComp}>
          <LoadingComponent />
        </div>
      ) : (
        <button type="submit" className={styles.btnAccedi}>
          Accedi
        </button>
      )}
    </form>
  );
}
