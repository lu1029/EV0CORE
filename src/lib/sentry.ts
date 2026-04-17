import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!dsn) return; // silently no-op when DSN isn't configured
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Capture 10% of transactions in prod, 100% in dev
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Privacy: don't send PII
    sendDefaultPii: false,
    beforeSend(event) {
      // Strip query strings that might contain tokens
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch { /* ignore */ }
      }
      return event;
    },
  });
}

export { Sentry };
