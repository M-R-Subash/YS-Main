"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

const MIN_VISIBLE_MS = 380;
const MAX_STALE_MS = 8000;

function PageTransitionLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams ? searchParams.toString() : "";

  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [targetLabel, setTargetLabel] = useState<string>("Loading...");

  const currentRouteRef = useRef<string>("");
  const startTimestampRef = useRef<number>(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize or update current route tracker
  useEffect(() => {
    const route = `${pathname}${searchKey ? `?${searchKey}` : ""}`;
    if (!currentRouteRef.current) {
      currentRouteRef.current = route;
    }
  }, [pathname, searchKey]);

  // Clean up all timers
  const clearAllTimers = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // Start the loading state
  const startLoading = useCallback(
    (destinationUrl?: string) => {
      clearAllTimers();

      // Determine friendly label from destination URL
      if (destinationUrl) {
        try {
          const parsed = new URL(destinationUrl, window.location.href);
          const path = parsed.pathname.replace(/\/$/, "");
          if (path === "" || path === "/") setTargetLabel("Entering Home...");
          else if (path.startsWith("/blogs")) setTargetLabel("Opening Blogs...");
          else if (path.startsWith("/careers")) setTargetLabel("Opening Careers...");
          else if (path.startsWith("/contact")) setTargetLabel("Opening Contact...");
          else if (path.startsWith("/services")) setTargetLabel("Opening Services...");
          else setTargetLabel("Navigating...");
        } catch {
          setTargetLabel("Navigating...");
        }
      } else {
        setTargetLabel("Loading...");
      }

      startTimestampRef.current = Date.now();
      setIsLoading(true);
      setVisible(true);
      setIsFading(false);

      // Safety timeout in case navigation gets cancelled or stuck
      safetyTimeoutRef.current = setTimeout(() => {
        completeLoading();
      }, MAX_STALE_MS);
    },
    [clearAllTimers]
  );

  // Complete and gracefully fade out
  const completeLoading = useCallback(() => {
    clearAllTimers();

    const elapsed = Date.now() - startTimestampRef.current;
    const waitTime = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimeoutRef.current = setTimeout(() => {
      setIsFading(true);
      const finishTimer = setTimeout(() => {
        setVisible(false);
        setIsLoading(false);
        setIsFading(false);
      }, 320);
      return () => clearTimeout(finishTimer);
    }, waitTime);
  }, [clearAllTimers]);

  // Listen to route changes to finish loading
  useEffect(() => {
    const route = `${pathname}${searchKey ? `?${searchKey}` : ""}`;
    if (currentRouteRef.current !== route) {
      currentRouteRef.current = route;

      // Ensure new page instantly starts at the top (no elevator/smooth scrolling effect)
      if (typeof window !== "undefined") {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      if (isLoading) {
        completeLoading();
      }
    }
  }, [pathname, searchKey, isLoading, completeLoading]);

  // Intercept click on internal links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore right/middle clicks or modified clicks
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }

      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      // Ignore external, target=_blank, download, or hash-only links
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return;
      }

      try {
        const dest = new URL(href, window.location.href);

        // Check if origin is external
        if (dest.origin !== window.location.origin) {
          return;
        }

        // Ignore if clicking a link to the exact same page with a hash
        if (
          dest.pathname === window.location.pathname &&
          dest.search === window.location.search
        ) {
          return;
        }

        // Start loading for valid internal page navigation!
        startLoading(dest.href);
      } catch {
        // invalid URL, ignore
      }
    };

    // Handle back/forward navigation
    const handlePopState = () => {
      startLoading();
    };

    // Handle escape key to cancel loader
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        completeLoading();
      }
    };

    // Allow programmatic dispatch
    const handleCustomStart = (e: Event) => {
      const customEvent = e as CustomEvent;
      startLoading(customEvent.detail?.url);
    };
    const handleCustomStop = () => {
      completeLoading();
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("ys:start-loading", handleCustomStart);
    window.addEventListener("ys:stop-loading", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("ys:start-loading", handleCustomStart);
      window.removeEventListener("ys:stop-loading", handleCustomStop);
      clearAllTimers();
    };
  }, [startLoading, completeLoading, clearAllTimers]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505]/92 backdrop-blur-xl transition-all duration-300 ease-out select-none ${
        isFading ? "opacity-0 pointer-events-none scale-[0.99]" : "opacity-100 pointer-events-auto scale-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
        {/* Ambient Dark Tech Radial Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

        {/* Soft Circular Amber Ambient Aura */}
        <div className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-[#F5A817]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

        {/* Minimalist Center Presentation */}
        <div className="relative flex flex-col items-center">
          {/* Orbital Precision Ring with Real YS Emblem */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* SVG Circular Precision Spinner */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin [animation-duration:2.8s] pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="rgba(245, 168, 23, 0.12)"
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#ysOrbitalGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="45 220"
              />
              <defs>
                <linearGradient id="ysOrbitalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5A817" />
                  <stop offset="100%" stopColor="#FEF08A" />
                </linearGradient>
              </defs>
            </svg>

            {/* Authentic YS Emblem Badge */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-transition-pulse">
              <Image
                src="/ys-icon.png"
                alt="YS Innovations"
                width={56}
                height={56}
                className="w-full h-full object-contain rounded-xl shadow-[0_0_24px_rgba(245,168,23,0.35)]"
                priority
              />
            </div>
          </div>

          {/* Clean Brand Typography & Target Status */}
          <div className="mt-4 flex flex-col items-center text-center space-y-2">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-white/90">
              YS Innovations
            </span>

            {/* Sleek Minimal Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f5a817] animate-pulse" />
              <span className="text-amber-300/90">{targetLabel}</span>
            </div>
          </div>
        </div>
      </div>
  );
}

export function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderInner />
    </Suspense>
  );
}
export default PageTransitionLoader;
