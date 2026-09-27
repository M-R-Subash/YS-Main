import { z } from "zod";

/**
 * Client-Side Environment Schema (main.ys)
 *
 * ONLY variables prefixed with NEXT_PUBLIC_ (plus NODE_ENV) are permitted here.
 * These variables are safely embedded into the client browser bundle.
 */
const clientEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_APP_NAME is required")
    .default("YS Innovations"),
  NEXT_PUBLIC_APP_DESCRIPTION: z
    .string()
    .default("Innovate Today, Lead Tomorrow — Enterprise Software & Cloud Solutions"),
  NEXT_PUBLIC_APP_VERSION: z
    .string()
    .default("1.0.0"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3001"),
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:3000"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const parsedClient = clientEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsedClient.success && process.env.SKIP_ENV_VALIDATION !== "true") {
  console.error(
    "❌ [Config:Client] Invalid client-safe environment variables:",
    JSON.stringify(parsedClient.error.flatten().fieldErrors, null, 2)
  );
}

const raw = parsedClient.success
  ? parsedClient.data
  : (process.env as unknown as ClientEnv);

export const clientConfig = {
  nodeEnv: raw.NODE_ENV || "development",
  isProduction: raw.NODE_ENV === "production",
  isDevelopment: raw.NODE_ENV !== "production" && raw.NODE_ENV !== "test",
  isTest: raw.NODE_ENV === "test",
  app: {
    name: raw.NEXT_PUBLIC_APP_NAME || "YS Innovations",
    description: raw.NEXT_PUBLIC_APP_DESCRIPTION || "Innovate Today, Lead Tomorrow — Enterprise Software & Cloud Solutions",
    version: raw.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    siteUrl: raw.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
    apiUrl: raw.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },
} as const;

export type ClientConfigType = typeof clientConfig;
