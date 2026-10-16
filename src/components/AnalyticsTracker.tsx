"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const engagedSentRef = useRef<boolean>(false);
  const engageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Guard against pre-rendering or SSR
    if (typeof window === "undefined" || (document.visibilityState as string) === "prerender") {
      return;
    }

    // 2. Guard against admin preview mode
    if (
      searchParams?.get("preview") === "true" ||
      document.cookie.includes("next-auth.session-token") ||
      document.cookie.includes("__Secure-next-auth.session-token")
    ) {
      return;
    }

    const currentPath = pathname || "/";

    // 3. Prevent React 19 StrictMode / rapid back-to-back duplicate firing using 2s cooldown
    const cooldownKey = `ys_analytics_cooldown:${currentPath}`;
    const lastTrackTime = sessionStorage.getItem(cooldownKey);
    const now = Date.now();

    if (lastTrackTime && now - parseInt(lastTrackTime, 10) < 2000) {
      return;
    }
    sessionStorage.setItem(cooldownKey, now.toString());

    // 4. Gather payload attributes
    const payload = {
      type: "pageview",
      path: currentPath,
      title: document.title || currentPath,
      referrer: document.referrer || "",
      utmSource: searchParams?.get("utm_source") || undefined,
      utmCampaign: searchParams?.get("utm_campaign") || undefined,
    };

    const sendBeacon = (data: object) => {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Fire initial Pageview beacon
    sendBeacon(payload);

    // 5. Engagement Detection (10s on page OR 50% scroll)
    engagedSentRef.current = false;

    const triggerEngaged = () => {
      if (engagedSentRef.current) return;
      engagedSentRef.current = true;

      sendBeacon({
        type: "engage",
        path: currentPath,
      });

      cleanupEngageListeners();
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolledRatio = window.scrollY / scrollHeight;
        if (scrolledRatio >= 0.5) {
          triggerEngaged();
        }
      }
    };

    // 10s timer trigger
    engageTimerRef.current = setTimeout(() => {
      triggerEngaged();
    }, 10000);

    // Scroll listener trigger
    window.addEventListener("scroll", handleScroll, { passive: true });

    const cleanupEngageListeners = () => {
      if (engageTimerRef.current) {
        clearTimeout(engageTimerRef.current);
        engageTimerRef.current = null;
      }
      window.removeEventListener("scroll", handleScroll);
    };

    return () => {
      cleanupEngageListeners();
    };
  }, [pathname, searchParams]);

  return null;
}
