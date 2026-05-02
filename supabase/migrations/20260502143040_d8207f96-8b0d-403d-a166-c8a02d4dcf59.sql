-- Restrict execution
REVOKE EXECUTE ON FUNCTION public.check_trial_reminders() FROM public, anon, authenticated;

-- Set safe search path
ALTER FUNCTION public.check_trial_reminders() SET search_path = public, net;

-- Enable cron extension if not enabled (usually is in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job (every day at midnight)
SELECT cron.schedule('check-trial-reminders-daily', '0 0 * * *', 'SELECT public.check_trial_reminders()');
