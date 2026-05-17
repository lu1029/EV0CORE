type StoredAuthSession = {
  access_token?: string;
  currentSession?: {
    access_token?: string;
  };
};

const readJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const hasValidSupabaseAccessToken = (token: string | undefined | null): boolean => {
  if (!token) return false;
  const payload = readJwtPayload(token);
  return typeof payload?.sub === "string" && payload.sub.length > 0;
};

export const clearMalformedSupabaseAuthSession = (): boolean => {
  if (typeof window === "undefined") return false;

  let cleared = false;

  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (!key.startsWith("sb-") || !key.endsWith("-auth-token")) return;

      const raw = window.localStorage.getItem(key);
      if (!raw) return;

      try {
        const stored = JSON.parse(raw) as StoredAuthSession;
        const accessToken = stored.access_token ?? stored.currentSession?.access_token;

        if (!hasValidSupabaseAccessToken(accessToken)) {
          window.localStorage.removeItem(key);
          cleared = true;
        }
      } catch {
        window.localStorage.removeItem(key);
        cleared = true;
      }
    });
  } catch {
    return cleared;
  }

  return cleared;
};