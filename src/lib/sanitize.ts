import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich HTML content to prevent stored Cross-Site Scripting (XSS - SEC-008).
 * Permits standard editorial formatting tags, headings, lists, tables, links, and images,
 * while stripping executable scripts, event handlers, and dangerous iframe/object tags.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "loading"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "base", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}
