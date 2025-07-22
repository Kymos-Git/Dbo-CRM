import { z } from "zod";

export const schemaCliente = z.object({
  RagSoc: z.string(),
  Indirizzo: z.string().nullable(),
  Citta: z.string().nullable(),
  Cap: z.string().nullable(),
  Provincia: z.string().nullable(),
  Zona: z.string().nullable(),
  Stato: z.string().nullable(),
  Tel: z.string().nullable(),
  Email: z.string().nullable(),
  Note: z.string().nullable(),
});

export type ClienteKeys = keyof typeof schemaCliente.shape;



export const schemaContatto = z.object({
  Nome: z.string(),
  Cognome: z.string(),
  RagSoc: z.string(),
  Cell: z.string().nullable(),
  Email: z.string().nullable(),
  Telefono: z.string().nullable(),
  Paese: z.string().nullable(),

});
export type ContattoKeys = keyof typeof schemaContatto.shape;



export const schemaVisita = z.object({
  Desc_Attivita: z.string().nullable(),
  Data_Attivita: z.string(),
  RagSoc: z.string(),
  Note: z.string().nullable(),
});

export type VisitaKeys = keyof typeof schemaVisita.shape;