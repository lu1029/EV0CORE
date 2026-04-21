/**
 * Resolve a stable OAuth redirect URI.
 *
 * Order of preference:
 * 1. Current window origin (works on .lovable.app, custom domains, localhost)
 * 2. VITE_PUBLIC_APP_URL (build-time fallback, e.g. published Lovable URL)
 * 3. Hardcoded published Lovable URL (last-resort fallback)
 *
 * This avoids "redirect_uri is required" errors when the custom domain
 * (e.g. ev0core.com) is temporarily unreachable or DNS is misconfigured.
 */
const FALLBACK_PUBLISHED_URL = "https://ev0core.lovable.app";

export function getOAuthRedirectUri(): string {
  // 1. Browser origin
  if (typeof window !== "undefined") {
    const origin =
      window.location.origin ||
      (window.location.protocol && window.location.host
        ? `${window.location.protocol}//${window.location.host}`
        : "");
    if (origin && /^https?:\/\//.test(origin)) {
      return origin;
    }
  }

  // 2. Build-time env override
  const envUrl = (import.meta as any)?.env?.VITE_PUBLIC_APP_URL as string | undefined;
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }

  // 3. Hardcoded published Lovable URL
  return FALLBACK_PUBLISHED_URL;
}
