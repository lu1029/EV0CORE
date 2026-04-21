/**
 * OAuth redirect URI configuration per environment.
 *
 * The OAuth provider (Google, Apple, etc.) requires the redirect_uri sent
 * during authorization to match EXACTLY what is configured in the provider's
 * console. To make this deterministic and avoid relying on `window.location.origin`
 * (which breaks on unstable custom domains), we centralize allowed values here.
 *
 * Resolution order (first valid wins):
 *   1. localStorage override `oauth_redirect_uri_override` (debugging only)
 *   2. Build-time env: VITE_OAUTH_REDIRECT_URI_PROD or VITE_OAUTH_REDIRECT_URI_DEV
 *   3. Hardcoded ENV_CONFIG below
 *   4. Current window.location.origin (last resort)
 *
 * The retry modal walks through `getOAuthRedirectUriCandidates()` so users can
 * fall back to the next allowed URI if the first one is rejected.
 */

export type AppEnvironment = "development" | "production";

interface EnvRedirectConfig {
  // Primary URI sent to the OAuth provider. MUST be registered in:
  //   - Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
  //   - Apple Developer → Services ID → Return URLs
  primary: string;
  // Optional fallbacks (also must be registered in the provider). Used by the
  // retry modal when the primary is rejected.
  fallbacks: string[];
}

const ENV_CONFIG: Record<AppEnvironment, EnvRedirectConfig> = {
  development: {
    primary: "http://localhost:8080",
    fallbacks: ["http://localhost:5173", "http://localhost:3000"],
  },
  production: {
    // Stable Lovable-managed domain (always reachable, SSL managed by Lovable).
    primary: "https://ev0core.lovable.app",
    // Custom domain — only kept as fallback because it can be unstable.
    fallbacks: ["https://www.ev0core.com", "https://ev0core.com"],
  },
};

const OVERRIDE_STORAGE_KEY = "oauth_redirect_uri_override";

export function detectEnvironment(): AppEnvironment {
  // import.meta.env.MODE is set by Vite ("development" | "production")
  const mode = (import.meta as any)?.env?.MODE as string | undefined;
  if (mode === "production") return "production";
  if (mode === "development") return "development";

  // Hostname heuristic as a fallback (e.g., when bundled outside Vite)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (/^localhost$/i.test(host) || host === "127.0.0.1") return "development";
  }
  return "production";
}

function readOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(OVERRIDE_STORAGE_KEY);
    if (v && /^https?:\/\//.test(v)) return v.replace(/\/$/, "");
  } catch {
    // localStorage may be unavailable (Safari private mode, etc.)
  }
  return null;
}

function readEnvOverride(env: AppEnvironment): string | null {
  const meta = (import.meta as any)?.env || {};
  const key = env === "production" ? "VITE_OAUTH_REDIRECT_URI_PROD" : "VITE_OAUTH_REDIRECT_URI_DEV";
  const value = meta[key] as string | undefined;
  if (value && /^https?:\/\//.test(value)) return value.replace(/\/$/, "");
  return null;
}

export function getOAuthRedirectUriCandidates(): string[] {
  const env = detectEnvironment();
  const cfg = ENV_CONFIG[env];
  const list: string[] = [];

  // 1. Manual override (debugging) — highest priority
  const override = readOverride();
  if (override) list.push(override);

  // 2. Build-time env override
  const envOverride = readEnvOverride(env);
  if (envOverride) list.push(envOverride);

  // 3. Configured primary
  list.push(cfg.primary);

  // 4. Configured fallbacks
  list.push(...cfg.fallbacks);

  // 5. Current origin (last resort, only if it isn't already in the list)
  if (typeof window !== "undefined") {
    const origin =
      window.location.origin ||
      (window.location.protocol && window.location.host
        ? `${window.location.protocol}//${window.location.host}`
        : "");
    if (origin && /^https?:\/\//.test(origin)) list.push(origin);
  }

  // Dedupe while preserving order
  return Array.from(new Set(list));
}

export function getOAuthRedirectUri(): string {
  const candidates = getOAuthRedirectUriCandidates();
  return candidates[0] ?? ENV_CONFIG.production.primary;
}

/**
 * Debug helper: set/clear a manual redirect_uri override at runtime.
 *
 *   import { setOAuthRedirectUriOverride } from "@/lib/oauthRedirect";
 *   setOAuthRedirectUriOverride("https://staging.example.com");
 *   setOAuthRedirectUriOverride(null); // clear
 */
export function setOAuthRedirectUriOverride(uri: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (uri === null) window.localStorage.removeItem(OVERRIDE_STORAGE_KEY);
    else window.localStorage.setItem(OVERRIDE_STORAGE_KEY, uri.replace(/\/$/, ""));
  } catch {
    // ignore
  }
}

/**
 * Returns the full configuration for inspection / debugging UIs.
 */
export function getOAuthRedirectConfig() {
  const env = detectEnvironment();
  return {
    environment: env,
    primary: ENV_CONFIG[env].primary,
    fallbacks: ENV_CONFIG[env].fallbacks,
    override: readOverride(),
    envOverride: readEnvOverride(env),
    candidates: getOAuthRedirectUriCandidates(),
  };
}
