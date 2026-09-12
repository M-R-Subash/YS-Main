import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL").default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("YS Innovations"),
  NEXT_PUBLIC_APP_DESCRIPTION: z
    .string()
    .default("Innovate Today, Lead Tomorrow — Enterprise Software & Cloud Solutions"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3001"),
  PREVIEW_SECRET: z.string().min(1, "PREVIEW_SECRET is required"),
  NEXT_PUBLIC_PREVIEW_SECRET: z.string().min(1, "NEXT_PUBLIC_PREVIEW_SECRET is required"),
  REVALIDATION_SECRET: z.string().min(1, "REVALIDATION_SECRET is required"),
});

const _env = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  PREVIEW_SECRET: process.env.PREVIEW_SECRET,
  NEXT_PUBLIC_PREVIEW_SECRET: process.env.NEXT_PUBLIC_PREVIEW_SECRET,
  REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
});

if (!_env.success && process.env.SKIP_ENV_VALIDATION !== "true") {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(_env.error.flatten().fieldErrors, null, 2)
  );
}

export const env = _env.success ? _env.data : (process.env as unknown as z.infer<typeof envSchema>);
