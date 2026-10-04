"use client";

import { useEffect } from "react";

/**
 * Reusable hook for receiving live CMS preview content updates.
 *
 * @param setContent State setter callback to receive updated content JSON
 * @param eventType Optional event type or array of event types (e.g. "PREVIEW_UPDATE_HOMEPAGE")
 */
export function usePreviewContent(
  setContent: (content: any) => void,
  eventType?: string | string[],
) {
  useEffect(() => {
    const targetOrigin =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const isAllowedOrigin = (origin: string, expectedOrigin: string) => {
      try {
        const incoming = new URL(origin);
        if (
          incoming.hostname.endsWith(".vercel.app") ||
          incoming.hostname === "localhost" ||
          incoming.hostname === "127.0.0.1" ||
          incoming.hostname.endsWith(".ysinnovations.com") ||
          incoming.hostname === "ysinnovations.com"
        ) {
          return true;
        }

        const expected = new URL(expectedOrigin);
        return expected.origin === incoming.origin;
      } catch {
        return origin === expectedOrigin;
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (!isAllowedOrigin(e.origin, targetOrigin)) return;
      if (!e.data?.content) return;

      const types = Array.isArray(eventType)
        ? eventType
        : eventType
          ? [eventType]
          : [];

      if (
        types.length === 0 ||
        types.includes(e.data?.type) ||
        e.data?.type === "PREVIEW_UPDATE_PAGE"
      ) {
        setContent(e.data.content);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setContent, eventType]);
}
