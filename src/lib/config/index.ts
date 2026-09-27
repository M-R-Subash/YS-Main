import { clientConfig } from "./client";
import { serverConfig } from "./server";

export * from "./client";
export * from "./server";

/**
 * Enterprise Application Configuration (main.ys)
 */
export const config = serverConfig;
export default config;

/**
 * Backward compatibility alias for legacy code importing `env`
 */
export const env = {
  // Database
  DATABASE_URL: serverConfig.database.url,
  DIRECT_URL: serverConfig.database.directUrl,

  // App & URLs
  NODE_ENV: clientConfig.nodeEnv,
  NEXT_PUBLIC_APP_NAME: clientConfig.app.name,
  NEXT_PUBLIC_APP_DESCRIPTION: clientConfig.app.description,
  NEXT_PUBLIC_APP_VERSION: clientConfig.app.version,
  NEXT_PUBLIC_SITE_URL: clientConfig.app.siteUrl,
  NEXT_PUBLIC_API_URL: clientConfig.app.apiUrl,

  // Security
  PREVIEW_SECRET: serverConfig.security.previewSecret,
  REVALIDATION_SECRET: serverConfig.security.revalidationSecret,

  // Rate Limiting
  THROTTLE_TTL: serverConfig.rateLimit.throttleTtl,
  THROTTLE_LIMIT: serverConfig.rateLimit.throttleLimit,
} as const;
