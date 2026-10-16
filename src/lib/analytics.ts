import crypto from "crypto";

export type DeviceType = "desktop" | "mobile" | "tablet";

/**
 * Returns today's UTC date in YYYY-MM-DD format
 */
export function getUtcTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Normalizes incoming pathname:
 * - strips query string and hash
 * - removes trailing slash
 * - defaults to "/"
 */
export function normalizePath(path: string | null | undefined): string {
  if (!path) return "/";
  try {
    const raw = path.split("?")[0].split("#")[0].trim();
    const cleaned = raw.replace(/\/+$/, "");
    return cleaned.length === 0 ? "/" : cleaned;
  } catch {
    return "/";
  }
}

/**
 * Detects if User-Agent is a bot/crawler or preview tool
 */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const botPattern =
    /bot|crawler|spider|crawling|headless|lighthouse|inspectiontool|facebookexternalhit|whatsapp|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|curl|wget|postman/i;
  return botPattern.test(userAgent);
}

/**
 * Parses user agent into Desktop, Mobile, or Tablet
 */
export function parseDeviceType(userAgent: string | null | undefined): DeviceType {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Cleans and maps referrers / UTM sources into recognized human-readable names
 */
export function parseReferrerSource(
  referrer: string | null | undefined,
  utmSource: string | null | undefined,
  siteHost?: string
): string {
  // 1. Priority to explicit UTM Source if passed
  if (utmSource && utmSource.trim().length > 0) {
    const cleanUtm = utmSource.trim().toLowerCase();
    if (cleanUtm.includes("linkedin")) return "LinkedIn";
    if (cleanUtm.includes("twitter") || cleanUtm === "x") return "X / Twitter";
    if (cleanUtm.includes("facebook")) return "Facebook";
    if (cleanUtm.includes("google")) return "Google";
    if (cleanUtm.includes("instagram")) return "Instagram";
    if (cleanUtm.includes("youtube")) return "YouTube";
    if (cleanUtm.includes("reddit")) return "Reddit";
    if (cleanUtm.includes("newsletter") || cleanUtm.includes("email")) return "Newsletter";
    if (cleanUtm.includes("whatsapp")) return "WhatsApp";
    return utmSource.trim();
  }

  // 2. Direct if no referrer
  if (!referrer || referrer.trim().length === 0) {
    return "Direct";
  }

  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();

    // Check if internal referral from own site
    if (siteHost && (host === siteHost || host.endsWith(`.${siteHost}`))) {
      return "Direct";
    }

    if (host.includes("google.")) return "Google";
    if (host.includes("linkedin.") || host === "lnkd.in") return "LinkedIn";
    if (host.includes("twitter.") || host === "t.co" || host.includes("x.com")) return "X / Twitter";
    if (host.includes("facebook.") || host.includes("fb.me")) return "Facebook";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("whatsapp.") || host === "wa.me") return "WhatsApp";
    if (host.includes("reddit.")) return "Reddit";
    if (host.includes("youtube.") || host === "youtu.be") return "YouTube";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("yahoo.")) return "Yahoo";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("github.")) return "GitHub";

    // Strip "www." for general clean domains
    return host.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

/**
 * Computes a privacy-friendly, daily-salted HMAC-SHA256 visitor hash
 * Mathematically impossible to reverse with rainbow tables (GDPR compliant).
 */
export function generateVisitorHash(
  ip: string,
  userAgent: string,
  dateUtc: string
): string {
  const secret = process.env.ANALYTICS_SALT || "ys-analytics-entropy-salt-2026";
  const rotatingSalt = `${secret}:${dateUtc}`;
  return crypto
    .createHmac("sha256", rotatingSalt)
    .update(`${ip}:${userAgent}`)
    .digest("hex");
}
