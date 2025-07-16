import { z } from "zod";

export const schemaContatto = z.object({
  nome: z.string(),
  cognome: z.string(),
  Rag_Sociale: z.string(),
  cellulare: z.string(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"),
  telefono: z.string(),
  città: z.string(),
  paese: z.string(),

});
