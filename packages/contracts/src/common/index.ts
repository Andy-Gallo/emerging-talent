import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z
      .object({
        page: z.number(),
        pageSize: z.number(),
        total: z.number(),
      })
      .optional(),
  });

export const VisibilityScopeSchema = z.enum([
  "campus_only",
  "selected_institutions",
  "public_network",
]);
