import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(120),
  institutionId: z.string().uuid().optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
