-- Security audit log table (immutable trail)
CREATE TABLE public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON public.security_audit_logs(created_at DESC);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.security_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (via edge functions)
CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- No updates or deletes allowed — logs are immutable
-- (no policies for UPDATE/DELETE means default deny under RLS)