/* ─────────────────────────────────────────────────────────────────────────
   lib/security/schemas.ts

   Zod request-body schemas for API routes. Every route should parse
   `unknown` JSON bodies through one of these with `.safeParse()` before
   touching the value — this rejects malformed/oversized/wrong-type
   payloads up front, regardless of how the endpoint is called.
───────────────────────────────────────────────────────────────────────── */
import { z } from 'zod';
import {
  EMAIL_FORMAT_REGEX,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
} from './sanitize';

const emailField = z
  .string()
  .trim()
  .min(1)
  .max(MAX_EMAIL_LENGTH)
  .regex(EMAIL_FORMAT_REGEX, 'Invalid email format');

export const loginSchema = z.object({
  email:    emailField,
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});
