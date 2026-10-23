/**
 * Security helper to validate incoming postMessage origins from the CMS/Admin.
 * Prevents DOM XSS and arbitrary postMessage spoofing (SEC-004).
 */

export function isTrustedCmsOrigin(origin: string): boolean {
  if (!origin) return false;

  try {
    const incomingUrl = new URL(origin);
    const configuredAdminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    const configured = new URL(configuredAdminUrl);

    // Exact match with configured admin origin
    if (incomingUrl.origin === configured.origin) {
      return true;
    }

    // Allow localhost/loopback in non-production environments
    if (process.env.NODE_ENV !== "production") {
      if (
        (incomingUrl.hostname === "localhost" || incomingUrl.hostname === "127.0.0.1") &&
        (incomingUrl.port === "3000" || incomingUrl.port === "3001")
      ) {
        return true;
      }
    }

    // Allow official production admin domain if configured
    if (incomingUrl.hostname === "admin.ysinnovations.com" && incomingUrl.protocol === "https:") {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Validates that a navigation URL is strictly an internal relative path.
 * Prevents open redirects and javascript: URI DOM XSS.
 */
export function isSafeRelativeUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes(":") &&
    !trimmed.includes("\\")
  );
}
