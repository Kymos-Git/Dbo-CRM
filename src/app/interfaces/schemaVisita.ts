import { z } from "zod";

export const schemaVisita = z.object({
  DescAttivita: z.string(),
  DataAttivita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida (formato YYYY-MM-DD)"),
  Ragione_Sociale: z.string(),
  Sem1: z.number().int().min(1).max(6),
  Sem2: z.number().int().min(1).max(6),
  Sem3: z.number().int().min(1).max(6),
  Sem4: z.number().int().min(1).max(6),
  note: z.string(),
});
