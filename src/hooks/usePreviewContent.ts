"use client";

import { useEffect } from "react";
import { isTrustedCmsOrigin } from "@/lib/safe-origin";

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
    const handleMessage = (e: MessageEvent) => {
      if (!isTrustedCmsOrigin(e.origin)) return;
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
