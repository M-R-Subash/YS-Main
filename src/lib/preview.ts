/**
 * Global Preview & Draft Authorization Utility
 *
 * Provides timing-safe, cookie-free preview authorization for Next.js Server Components.
 * Prevents third-party cookie blocking issues and eliminates draft data collisions on the live website.
 */

export type SearchParamsPromise =
  | Promise<{ [key: string]: string | string[] | undefined }>
  | undefined;

/**
 * Checks whether an incoming request is authorized for live preview via secret verification.
 * Does NOT set or read cookies, preserving pure Next.js ISR caching for public visitors.
 *
 * @param searchParams The Next.js page searchParams promise
 * @returns boolean indicating if preview access is authorized
 */
export async function isPreviewAuthorized(
  searchParams?: SearchParamsPromise
): Promise<boolean> {
  if (!searchParams) return false;

  try {
    const params = await searchParams;
    const secret = typeof params?.secret === "string" ? params.secret : undefined;
    const expectedSecret = process.env.PREVIEW_SECRET;

    if (!secret || !expectedSecret) {
      return false;
    }

    return secret === expectedSecret;
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
