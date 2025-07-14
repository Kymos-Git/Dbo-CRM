import { z } from "zod";

export const schemaContatto = z.object({
  nome: z.string(),
  cognome: z.string(),
  Rag_Sociale: z.string(),
  cellulare: z.string(),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email non valida"),
  disabilita: z.boolean(),
  telefono: z.string(),
  città: z.string(),
  paese: z.string(),
  Sem1: z.number().int().min(1).max(6),
  Sem2: z.number().int().min(1).max(6),
  Sem3: z.number().int().min(1).max(6),
  Sem4: z.number().int().min(1).max(6),
});
