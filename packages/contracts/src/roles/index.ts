import { z } from "zod";

export const RoleCreateSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2).max(120),
  roleType: z.string().default("performer"),
  compensationType: z.string().default("unpaid"),
  compensationText: z.string().optional(),
  isRemote: z.boolean().default(false),
  deadlineAt: z.string().datetime().optional(),
  status: z.enum(["draft", "open", "paused", "closed"]).default("draft"),
  roleQuestions: z.array(z.object({ question: z.string(), isRequired: z.boolean().default(false) })).default([]),
});
