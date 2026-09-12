"use client";

import { useEffect } from "react";

/**
 * Global Visual Inspector and Iframe Controller
 * 
 * Automatically active when rendered inside the CMS admin iframe.
 * 1. Enables bidirectional Click-to-Edit on any element with `data-section` or `id="section-*"`.
 * 2. Provides visual feedback with a sleek amber pulse outline on clicked sections.
 * 3. Handles `SCROLL_TO_SECTION` messages dispatched by the admin editor.
 * 4. Prevents accidental link navigation inside the preview sandbox.
 */
export function PreviewInspector() {
  useEffect(() => {
    // Only execute if running within an iframe
    if (typeof window === "undefined" || window === window.parent) {
      return;
    }

    const targetOrigin =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const isAllowedOrigin = (origin: string, expectedOrigin: string) => {
      try {
        const expected = new URL(expectedOrigin);
        const incoming = new URL(origin);
        return expected.origin === incoming.origin;
      } catch {
        return origin === expectedOrigin;
      }
    };

    // Listen for commands dispatched from admin parent
    const handleMessage = (e: MessageEvent) => {
      if (!isAllowedOrigin(e.origin, targetOrigin)) return;

      if (e.data?.type === "SCROLL_TO_SECTION" && e.data?.section) {
        const sectionId = e.data.section;
        const element =
          document.querySelector(`[data-section~="${sectionId}"]`) ||
          document.getElementById(`section-${sectionId}`) ||
          document.getElementById(sectionId);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Capture clicks inside the iframe preview
    const handleIframeClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Prevent navigating away inside the preview iframe
      if (target.closest("a")) {
        e.preventDefault();
      }

      // Detect closest section element
      const sectionEl = (target.closest("[data-section]") ||
        target.closest('[id^="section-"]')) as HTMLElement | null;

      if (sectionEl) {
        const sectionAttr = sectionEl.getAttribute("data-section");
        const sectionName =
          sectionAttr || sectionEl.id.replace("section-", "");

        if (sectionName) {
          // Visual feedback: momentary amber outline pulse
          sectionEl.style.outline = "2px solid #F5A817";
          sectionEl.style.outlineOffset = "-2px";
          sectionEl.style.transition = "outline 0.3s ease";
          setTimeout(() => {
            sectionEl.style.outline = "none";
          }, 1200);

          // Notify parent admin editor to uncollapse and focus this section
          window.parent.postMessage(
            { type: "INSPECT_SECTION", section: sectionName },
            targetOrigin,
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    document.addEventListener("click", handleIframeClick, true);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", handleIframeClick, true);
    };
  }, []);

  return null;
}
