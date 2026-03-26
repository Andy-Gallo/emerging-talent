import { z } from "zod";

export const SessionPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["user", "platform_admin"]),
  email: z.string().email(),
  displayName: z.string(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

export const AUTH_COOKIE = "etp_session";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
