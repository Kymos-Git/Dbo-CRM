"use client";

import * as interfaces from "@/app/interfaces/interfaces";

/**
 * Questo modulo contiene funzioni per gestire l'interazione con un'API CRM,
 * consentendo il recupero, filtraggio e modifica di clienti, contatti e visite.
 * Le chiamate HTTP sono effettuate tramite una funzione fetch personalizzata passata come parametro.
 * Inoltre viene implementato un caching dell'URL base dell'API preso dal file di configurazione.
 */

// Funzione helper per recuperare BASE_API_URL da config.json
let cachedBaseUrl: string | null = null;

/**
 * Recupera e memorizza in cache l'URL base dell'API da config.json.
 * Restituisce l'URL base da usare per le chiamate API.
 */
export async function getBaseApiUrl(): Promise<string> {
  if (cachedBaseUrl !== null) {
    return cachedBaseUrl;
  }

  const res = await fetch("/config.json");
  if (!res.ok) throw new Error("Errore nel fetch della configurazione");
  const config = await res.json();
  cachedBaseUrl = config.BASE_API_URL;
  if (typeof cachedBaseUrl !== "string") {
    throw new Error("BASE_API_URL non è una stringa valida");
  }
  return cachedBaseUrl;
}

/**
 * Recupera la lista completa dei clienti tramite chiamata POST.
 * @param fetchFn Funzione fetch personalizzata.
 * @returns Array di clienti.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getClienti(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Cliente[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmClienti`
  const res = await fetchFn("/api/getCrmClienti/0", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pageSize: 100 }),
    method: "POST",
  });
  if (!res.ok) throw new Error("Errore nel caricamento dei clienti");
  return (await res.json()) as interfaces.Cliente[];
}

/**
 * Recupera la lista completa dei contatti tramite chiamata POST.
 * @param fetchFn Funzione fetch personalizzata.
 * @returns Array di contatti.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getContatti(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Contatto[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmContatti`
  const res = await fetchFn(`/api/GetCrmContatti/0`, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pageSize: 100 }),
    method: "POST",
  });
  if (!res.ok) throw new Error("Errore nel caricamento dei contatti");
  return (await res.json()) as interfaces.Contatto[];
}

/**
 * Recupera la lista delle visite dell'utente tramite chiamata POST.
 * @param fetchFn Funzione fetch personalizzata.
 * @returns Array di visite.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getVisite(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Visita[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmVisite`
  const res = await fetchFn(`/api/GetCrmVisiteByUser`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!res.ok) throw new Error("Errore nel caricamento delle visite");
  return (await res.json()) as interfaces.Visita[];
}

/**
 * Recupera visite filtrate in base a parametri passati.
 * @param fetchFn Funzione fetch personalizzata.
 * @param filters Oggetto contenente i filtri come coppie chiave/valore.
 * @returns Array di visite filtrate.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getVisiteFiltrate(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  filters: Record<string, string>
): Promise<interfaces.Visita[]> {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetchFn(`/api/Visite?=${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) throw new Error("Errore nel fetch delle visite filtrate");
  return await response.json();
}

/**
 * Recupera contatti filtrati in base a parametri passati.
 * @param fetchFn Funzione fetch personalizzata.
 * @param filters Oggetto contenente i filtri come coppie chiave/valore.
 * @returns Array di contatti filtrati.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getContattiFiltrati(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  filters: Record<string, string>
): Promise<interfaces.Contatto[]> {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetchFn(`/api/Contatti?=${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) throw new Error("Errore nel fetch dei contatti filtrati");
  return await response.json();
}

/**
 * Recupera clienti filtrati in base a parametri passati.
 * @param fetchFn Funzione fetch personalizzata.
 * @param filters Oggetto contenente i filtri come coppie chiave/valore.
 * @returns Array di clienti filtrati.
 * @throws Errore se la chiamata non ha successo.
 */
export async function getClientiFiltrati(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  filters: Record<string, string>
): Promise<interfaces.Cliente[]> {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetchFn(`/api/Clienti?=${queryParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) throw new Error("Errore nel fetch dei clienti filtrati");
  return await response.json();
}

// Funzioni di invio, aggiornamento ed eliminazione

export async function sendCliente(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "INS",
  };

  const res = await fetchFn("/api/StpClienti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel invio del cliente");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function sendContatto(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "INS",
  };

  const res = await fetchFn("/api/StpContatti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel invio del contatto");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function sendVisita(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "INS",
  };

  const res = await fetchFn("/api/StpVisite_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel invio della visita");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

//======update======

export async function UpdateCliente(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "UPD",
  };

  const res = await fetchFn("/api/StpClienti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel update del cliente");
  const parsed = await res.json();

  if (parsed.KyRes === '0') {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function UpdateContatto(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "UPD",
  };

  const res = await fetchFn("/api/StpContatti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel update del contatto");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function UpdateVisita(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "UPD",
  };

  const res = await fetchFn("/api/StpVisite_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nel update della visita");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

//=========delete=======

export async function deleteCliente(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "DEL",
  };

  const res = await fetchFn("/api/StpClienti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nell' eliminazione del cliente");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function deleteContatto(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "DEL",
  };

  const res = await fetchFn("/api/StpContatti_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nell' eliminazione del contatto");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}

export async function deleteVisita(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>,
  data: any
) {
  const newData = {
    ...data,
    KYAction: "DEL",
  };

  const res = await fetchFn("/api/StpVisite_KyMng", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(newData),
  });
  if (!res.ok) throw new Error("Errore nell' eliminazione della visita");
  const parsed = await res.json();

  if (parsed.KyRes === 0) {
    throw new Error("Nessuna modifica eseguita");
  }
  return parsed;
}
