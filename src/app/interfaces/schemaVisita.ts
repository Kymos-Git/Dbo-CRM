import { z } from "zod";

export const schemaVisita = z.object({
  DescAttivita: z.string(),
  DataAttivita: z.date(),
  Ragione_Sociale: z.string(),
  note: z.string(),
});
