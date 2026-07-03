import { z } from "zod";

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().min(1),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
