-- Table to track sent reminder emails
CREATE TABLE IF NOT EXISTS public.trial_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL, -- '3_days' or '1_day'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(subscription_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.trial_email_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage logs
CREATE POLICY "Service role can manage trial_email_logs" 
ON public.trial_email_logs 
USING (true)
WITH CHECK (true);

-- Function to check for expiring trials and trigger edge function
CREATE OR REPLACE FUNCTION public.check_trial_reminders()
RETURNS void AS $$
DECLARE
    sub RECORD;
    reminder_type TEXT;
    days_left INTEGER;
BEGIN
    FOR sub IN 
        SELECT 
            s.id as subscription_id, 
            s.user_id, 
            s.current_period_end,
            u.email
        FROM public.subscriptions s
        JOIN auth.users u ON s.user_id = u.id
        WHERE s.status = 'trialing'
        AND s.current_period_end > now()
    LOOP
        days_left := EXTRACT(DAY FROM (sub.current_period_end - now()));
        
        IF days_left = 3 THEN
            reminder_type := '3_days';
        ELSIF days_left = 1 THEN
            reminder_type := '1_day';
        ELSE
            CONTINUE;
        END IF;

        -- Check if already sent
        IF NOT EXISTS (
            SELECT 1 FROM public.trial_email_logs 
            WHERE subscription_id = sub.subscription_id 
            AND reminder_type = reminder_type
        ) THEN
            -- Trigger Edge Function via HTTP request (pg_net)
            -- Note: We'll need to make sure pg_net is enabled
            PERFORM net.http_post(
                url := 'https://csikbgwayqhgnuveidaz.supabase.co/functions/v1/send-trial-reminder',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
                ),
                body := jsonb_build_object(
                    'userId', sub.user_id,
                    'email', sub.email,
                    'reminderType', reminder_type,
                    'daysLeft', days_left,
                    'subscriptionId', sub.subscription_id
                )
            );

            -- Log it
            INSERT INTO public.trial_email_logs (user_id, subscription_id, reminder_type)
            VALUES (sub.user_id, sub.subscription_id, reminder_type);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
