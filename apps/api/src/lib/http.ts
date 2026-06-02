import { z } from "zod";

// Shape estándar para respuestas de error que emitimos manualmente (ej. 404).
export const errorSchema = z.object({ message: z.string() });
