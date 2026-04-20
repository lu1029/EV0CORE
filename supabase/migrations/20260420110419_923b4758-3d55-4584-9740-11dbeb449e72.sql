-- Fix has_active_subscription: a subscription set to cancel_at_period_end with NULL end date should NOT be active
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND environment = check_env
    AND (
      -- Active/trialing AND not cancelled AND (no end date OR future end date)
      (status IN ('active', 'trialing')
        AND COALESCE(cancel_at_period_end, false) = false
        AND (current_period_end IS NULL OR current_period_end > now()))
      -- Active/trialing but cancelled at period end: only if end date is still in future
      OR (status IN ('active', 'trialing')
        AND COALESCE(cancel_at_period_end, false) = true
        AND current_period_end IS NOT NULL
        AND current_period_end > now())
      -- Fully cancelled but still within paid period
      OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > now())
    )
  );
$function$;

-- Re-sync premium status for all users to apply the fix
UPDATE public.profiles p
SET is_premium = public.has_active_subscription(p.user_id, 'sandbox')
   OR public.has_active_subscription(p.user_id, 'live');