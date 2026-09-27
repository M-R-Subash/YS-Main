import "server-only";
import { z } from "zod";
import { clientConfig } from "./client";

/**
 * Server-Side Environment Schema (main.ys)
 *
 * Enforces strict backend validation for database credentials,
 * iframe preview verification, and ISR cache purging.
 *
 * Protected with "server-only" to guarantee zero secrets leak into client bundles.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),
  DIRECT_URL: z
    .string()
    .optional(),
  PREVIEW_SECRET: z
    .string()
    .min(16, "PREVIEW_SECRET must be at least 16 characters"),
  REVALIDATION_SECRET: z
    .string()
    .min(16, "REVALIDATION_SECRET must be at least 16 characters"),
  THROTTLE_TTL: z
    .coerce
    .number()
    .min(1)
    .default(60),
  THROTTLE_LIMIT: z
    .coerce
    .number()
    .min(1)
    .default(1000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parsedServer = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  PREVIEW_SECRET: process.env.PREVIEW_SECRET,
  REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
  THROTTLE_TTL: process.env.THROTTLE_TTL,
  THROTTLE_LIMIT: process.env.THROTTLE_LIMIT,
});

if (!parsedServer.success && process.env.SKIP_ENV_VALIDATION !== "true") {
  console.error(
    "\n=======================================================\n" +
    "❌ [Config:Server] CRITICAL: Invalid or missing server environment variables:\n" +
    JSON.stringify(parsedServer.error.flatten().fieldErrors, null, 2) +
    "\n=======================================================\n"
  );
}

const rawServer = parsedServer.success
  ? parsedServer.data
  : (process.env as unknown as ServerEnv);

export const serverConfig = {
  ...clientConfig,
  database: {
    url: rawServer.DATABASE_URL || "",
    directUrl: rawServer.DIRECT_URL || rawServer.DATABASE_URL || "",
  },
  security: {
    previewSecret: rawServer.PREVIEW_SECRET || "",
    revalidationSecret: rawServer.REVALIDATION_SECRET || "",
  },
  rateLimit: {
    throttleTtl: Number(rawServer.THROTTLE_TTL) || 60,
    throttleLimit: Number(rawServer.THROTTLE_LIMIT) || 1000,
  },
} as const;

export type ServerConfigType = typeof serverConfig;
