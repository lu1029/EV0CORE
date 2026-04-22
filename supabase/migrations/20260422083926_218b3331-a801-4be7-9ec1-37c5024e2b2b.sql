-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON public.rate_limits(key, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role should manage; deny anon by default. Service role bypasses RLS automatically,
-- but having an explicit policy prevents direct access from clients.
DROP POLICY IF EXISTS "service_role_only" ON public.rate_limits;
CREATE POLICY "service_role_only"
  ON public.rate_limits
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Caption max length on feed_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'caption_max_length'
  ) THEN
    ALTER TABLE public.feed_posts
      ADD CONSTRAINT caption_max_length CHECK (char_length(caption) <= 2000);
  END IF;
END $$;

-- Submission token to prevent double POST on feed
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS submission_token UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_posts_submission_token
  ON public.feed_posts(submission_token)
  WHERE submission_token IS NOT NULL;