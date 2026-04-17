import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!dsn) return; // silently no-op when DSN isn't configured
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.httpClientIntegration(),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch { /* ignore */ }
      }
      // Drop auth tokens from headers if any
      if (event.request?.headers) {
        delete (event.request.headers as any).Authorization;
        delete (event.request.headers as any).authorization;
        delete (event.request.headers as any).cookie;
      }
      return event;
    },
  });
}

export { Sentry };
