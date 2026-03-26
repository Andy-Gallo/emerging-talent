import { z } from "zod";
import { VisibilityScopeSchema } from "../common/index";

export const ProjectCreateSchema = z.object({
  organizationId: z.string().uuid(),
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  summary: z.string().min(10).max(2000),
  description: z.string().min(20).max(10000),
  visibilityScope: VisibilityScopeSchema,
  selectedInstitutionIds: z.array(z.string().uuid()).optional(),
  locationText: z.string().optional(),
  compensationSummary: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
});
