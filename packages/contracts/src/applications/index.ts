import { z } from "zod";

export const ApplicationCreateSchema = z.object({
  roleId: z.string().uuid(),
  note: z.string().max(3000).optional(),
  answers: z.array(z.object({ questionId: z.string().uuid(), answer: z.string().max(3000) })).default([]),
  mediaAssetIds: z.array(z.string().uuid()).default([]),
  submit: z.boolean().default(false),
});

export const ApplicationStatusSchema = z.enum([
  "draft",
  "submitted",
  "in_review",
  "shortlisted",
  "audition_requested",
  "audition_completed",
  "accepted",
  "rejected",
  "withdrawn",
]);
