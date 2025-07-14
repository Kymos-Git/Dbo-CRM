"use client";

import * as interfaces from "@/app/interfaces/interfaces";

// Funzione helper per recuperare BASE_API_URL da config.json
let cachedBaseUrl: string | null = null;

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

export async function getClienti(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Cliente[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmClienti`
  const res=await fetchFn('/api/getCrmClienti/0'
    ,{
    headers: {
      "Content-Type": "application/json",
    },
     body: JSON.stringify({ pageSize: 100 }),
     method:'POST'
  });
  if (!res.ok) throw new Error("Errore nel caricamento dei clienti");
  return (await res.json()) as interfaces.Cliente[];
}

export async function getContatti(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Contatto[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmContatti`
  const res = await fetchFn(`/api/GetCrmContatti/0`
    ,{
      headers: {
      "Content-Type": "application/json",
    },
     body: JSON.stringify({ pageSize: 100 }),
     method:'POST'
  });
  if (!res.ok) throw new Error("Errore nel caricamento dei contatti");
  return (await res.json()) as interfaces.Contatto[];
}

export async function getVisite(
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>
): Promise<interfaces.Visita[]> {
  // const baseUrl = await getBaseApiUrl();
  // const res = await fetchFn(`${baseUrl}/GetCrmVisite`
  const res = await fetchFn(`/api/GetCrmVisiteByUser`
    ,{
      headers: {
      "Content-Type": "application/json",
    },
    method:'POST'
  });
  if (!res.ok) throw new Error("Errore nel caricamento delle visite");
  return (await res.json()) as interfaces.Visita[];
}
