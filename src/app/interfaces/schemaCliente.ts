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

export type Cliente = z.infer<typeof schemaCliente>;