/**
 * Questo file contiene una interfaccia per gestire il salvataggio,
 * la lettura e la rimozione di dati nel browser utilizzando IndexedDB.
 */




// Funzione che salva un valore (value) associato a una chiave (key) nel database IndexedDB
export function setItem(key: string, value: string) {
  // Ritorna una Promise che si risolverà quando l'operazione sarà completata
  return new Promise<void>((resolve, reject) => {
    // Apre o crea un database chiamato 'AuthDB', versione 1
    const openRequest = indexedDB.open("AuthDB", 1);

    // Se il database viene creato per la prima volta (o aggiornato), crea l'oggetto 'auth'
    openRequest.onupgradeneeded = () => {
      openRequest.result.createObjectStore("auth");
    };

    // Gestione dell'errore in fase di apertura
    openRequest.onerror = () => reject(openRequest.error);

    // Una volta aperto con successo il DB...
    openRequest.onsuccess = () => {
      const db = openRequest.result;

      // Avvia una transazione in modalità scrittura sullo store 'auth'
      const tx = db.transaction("auth", "readwrite");
      const store = tx.objectStore("auth");

      // Inserisce o aggiorna il valore associato alla chiave
      store.put(value, key);

      // Se tutto va bene, risolviamo la Promise
      tx.oncomplete = () => resolve();

      // Se la transazione fallisce, rigettiamo la Promise con l'errore
      tx.onerror = () => reject(tx.error);
    };
  });
}

// Funzione che recupera un valore associato a una chiave dal database
export function getItem(key: string) {
  // Ritorna una Promise che si risolverà con il valore associato alla chiave
  return new Promise((resolve, reject) => {
    // Apre o crea il database 'AuthDB'
    const openRequest = indexedDB.open("AuthDB", 1);

    // Crea lo store 'auth' se è la prima volta
    openRequest.onupgradeneeded = () => {
      openRequest.result.createObjectStore("auth");
    };

    // Gestione errore in apertura
    openRequest.onerror = () => reject(openRequest.error);

    // Apertura riuscita
    openRequest.onsuccess = () => {
      const db = openRequest.result;

      // Transazione in sola lettura
      const tx = db.transaction("auth", "readonly");
      const store = tx.objectStore("auth");

      // Richiesta per ottenere il valore associato alla chiave
      const getRequest = store.get(key);

      // Gestione errore nella richiesta
      getRequest.onerror = () => reject(getRequest.error);

      // Se tutto va bene, restituisce il valore
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
  });
}

// Funzione che elimina una voce associata a una chiave dal database
export function removeItem(key: string) {
  // Ritorna una Promise che si risolverà al termine dell'eliminazione
  return new Promise<void>((resolve, reject) => {
    // Apre o crea il database 'AuthDB'
    const openRequest = indexedDB.open("AuthDB", 1);

    // Se necessario, crea lo store 'auth'
    openRequest.onupgradeneeded = () => {
      openRequest.result.createObjectStore("auth");
    };

    // Gestione errore apertura DB
    openRequest.onerror = () => reject(openRequest.error);

    // Apertura riuscita
    openRequest.onsuccess = () => {
      const db = openRequest.result;

      // Transazione in scrittura
      const tx = db.transaction("auth", "readwrite");
      const store = tx.objectStore("auth");

      // Elimina la voce con la chiave specificata
      store.delete(key);

      // Completamento con successo
      tx.oncomplete = () => resolve();

      // Errore durante la transazione
      tx.onerror = () => reject(tx.error);
    };
  });
}
