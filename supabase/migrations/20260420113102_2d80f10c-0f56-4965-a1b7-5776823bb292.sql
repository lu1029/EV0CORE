-- Add 'pix' as a valid environment and create a table for pending pix charges
CREATE TABLE IF NOT EXISTS public.pix_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  external_id text NOT NULL UNIQUE,
  abacate_id text,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pix_charges_user ON public.pix_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_charges_external_id ON public.pix_charges(external_id);
CREATE INDEX IF NOT EXISTS idx_pix_charges_abacate_id ON public.pix_charges(abacate_id);

ALTER TABLE public.pix_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pix charges"
  ON public.pix_charges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages pix charges"
  ON public.pix_charges FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_pix_charges_updated_at
BEFORE UPDATE ON public.pix_charges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update has_active_subscription to also recognize the 'pix' environment when called with 'pix'
-- (no schema change needed; environment column already accepts any text)

-- Update sync_premium_status trigger to consider pix subscriptions too
CREATE OR REPLACE FUNCTION public.sync_premium_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET is_premium = (
    SELECT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = NEW.user_id
      AND (
        (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
    )
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on subscriptions
DROP TRIGGER IF EXISTS subscriptions_sync_premium ON public.subscriptions;
CREATE TRIGGER subscriptions_sync_premium
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_premium_status();