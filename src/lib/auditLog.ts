import { supabase } from "@/integrations/supabase/client";

export type SecurityEvent =
  | "login_success"
  | "login_failure"
  | "logout"
  | "logout_inactivity"
  | "consent_accepted"
  | "account_deletion_requested"
  | "premium_status_changed"
  | "password_changed";

/**
 * Fire-and-forget audit logger. Never throws, never blocks the UI.
 * Calls the log-security-event edge function which writes to security_audit_logs.
 */
export function logSecurityEvent(event_type: SecurityEvent, event_data: Record<string, unknown> = {}) {
  try {
    supabase.functions.invoke("log-security-event", {
      body: { event_type, event_data },
    }).catch(() => {
      /* silent — audit logging must never break UX */
    });
  } catch {
    /* silent */
  }
}
