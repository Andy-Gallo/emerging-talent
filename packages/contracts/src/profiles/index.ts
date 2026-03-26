import { z } from "zod";

export const TalentProfileSchema = z.object({
  headline: z.string().max(180).optional(),
  bio: z.string().max(4000).optional(),
  disciplines: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  locationCity: z.string().optional(),
  locationRegion: z.string().optional(),
  isPublic: z.boolean().default(true),
});
