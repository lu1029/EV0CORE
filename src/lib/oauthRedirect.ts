/**
 * Resolve a stable OAuth redirect URI.
 *
 * Returns an ordered list of candidates:
 * 1. Current window origin (works on .lovable.app, custom domains, localhost)
 * 2. VITE_PUBLIC_APP_URL (build-time fallback)
 * 3. Hardcoded published Lovable URL (last-resort fallback)
 *
 * `getOAuthRedirectUri()` returns the first candidate.
 * `getOAuthRedirectUriCandidates()` returns the full deduped list,
 * which lets us retry with the next option if the first fails.
 */
const FALLBACK_PUBLISHED_URL = "https://ev0core.lovable.app";

export function getOAuthRedirectUriCandidates(): string[] {
  const list: string[] = [];

  if (typeof window !== "undefined") {
    const origin =
      window.location.origin ||
      (window.location.protocol && window.location.host
        ? `${window.location.protocol}//${window.location.host}`
        : "");
    if (origin && /^https?:\/\//.test(origin)) list.push(origin);
  }

  const envUrl = (import.meta as any)?.env?.VITE_PUBLIC_APP_URL as string | undefined;
  if (envUrl && /^https?:\/\//.test(envUrl)) list.push(envUrl.replace(/\/$/, ""));

  list.push(FALLBACK_PUBLISHED_URL);

  // Dedupe while preserving order
  return Array.from(new Set(list));
}

export function getOAuthRedirectUri(): string {
  return getOAuthRedirectUriCandidates()[0] ?? FALLBACK_PUBLISHED_URL;
}
