/**
 * Global Preview & Draft Authorization Utility
 *
 * Provides timing-safe, cookie-free preview authorization for Next.js Server Components.
 * Supports both master preview secret and short-lived HMAC-signed tokens.
 */

import crypto from "crypto";
import { serverConfig } from "@/lib/config/server";

export type SearchParamsPromise =
  | Promise<{ [key: string]: string | string[] | undefined }>
  | undefined;

/**
 * Checks whether an incoming request is authorized for live preview via secret or signed token verification.
 * Does NOT set or read cookies, preserving pure Next.js ISR caching for public visitors.
 *
 * @param searchParams The Next.js page searchParams promise
 * @param slug Optional slug context for route-bound signed tokens
 * @returns boolean indicating if preview access is authorized
 */
export async function isPreviewAuthorized(
  searchParams?: SearchParamsPromise,
  slug?: string
): Promise<boolean> {
  if (!searchParams) return false;

  try {
    const params = await searchParams;
    const secret = typeof params?.secret === "string" ? params.secret : undefined;
    const expectedSecret = serverConfig.security.previewSecret;

    if (!secret || !expectedSecret) {
      return false;
    }

    // 1. Master secret verification (timing-safe)
    if (
      secret.length === expectedSecret.length &&
      crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expectedSecret))
    ) {
      return true;
    }

    // 2. Short-lived HMAC-signed token verification (${expiresAt}.${signature})
    const dotIndex = secret.indexOf(".");
    if (dotIndex !== -1) {
      const expiresStr = secret.substring(0, dotIndex);
      const signature = secret.substring(dotIndex + 1);
      const expiresAt = parseInt(expiresStr, 10);

      if (isNaN(expiresAt) || expiresAt < Date.now()) {
        return false; // Token expired
      }

      // Verify HMAC against slug-bound token variations or wildcard token
      const slugVariants = new Set<string>();
      if (slug) {
        slugVariants.add(slug);
        slugVariants.add(slug.startsWith("/") ? slug.slice(1) : `/${slug}`);
      }
      slugVariants.add(""); // wildcard token

      for (const variant of slugVariants) {
        const expectedSig = crypto
          .createHmac("sha256", expectedSecret)
          .update(`${variant}:${expiresAt}`)
          .digest("hex");

        if (
          signature.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
        ) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Resolves the effective content for a page (draftContent when in preview mode, otherwise content).
 *
 * @param page The database page object containing content and optional draftContent
 * @param isPreview Whether the current request is an authorized preview
 * @returns The resolved JSON content to render
 */
export function getEffectiveContent<T = any>(
  page: { content?: T | null; draftContent?: T | null; [key: string]: any } | null | undefined,
  isPreview: boolean
): T | null {
  if (!page) return null;
  if (isPreview && page.draftContent !== undefined && page.draftContent !== null) {
    return page.draftContent as T;
  }
  return (page.content as T) ?? null;
}
