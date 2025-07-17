import { z } from "zod";

export const schemaCliente = z.object({
  ragione_sociale: z.string(),
  indirizzo: z.string(),
  citta: z.string(),
  cap: z.string(),
  provincia: z.string(),
  Regione: z.string(),
  Stato: z.string(),
  tel: z.string(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"),
  note: z.string(),
});

export type ClienteKeys = keyof typeof schemaCliente.shape;



export const schemaContatto = z.object({
  nome: z.string(),
  cognome: z.string(),
  Rag_Sociale: z.string(),
  cellulare: z.string(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"),
  telefono: z.string(),
  paese: z.string(),

});
export type ContattoKeys = keyof typeof schemaContatto.shape;



export const schemaVisita = z.object({
  DescAttivita: z.string(),
  DataAttivita: z.date(),
  Ragione_Sociale: z.string(),
  note: z.string(),
});

export type VisitaKeys = keyof typeof schemaVisita.shape;