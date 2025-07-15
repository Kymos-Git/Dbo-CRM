import { z } from "zod";

export const schemaVisita = z.object({
  DescAttivita: z.string(),
  DataAttivita: z.date(),
  Ragione_Sociale: z.string(),
  Sem1: z.number().int().min(1).max(6),
  Sem2: z.number().int().min(1).max(6),
  Sem3: z.number().int().min(1).max(6),
  Sem4: z.number().int().min(1).max(6),
  note: z.string(),
});
