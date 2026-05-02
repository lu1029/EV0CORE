DROP POLICY "Service role can manage all notifications" ON public.notifications;

CREATE POLICY "Service role can manage all notifications" 
ON public.notifications 
TO service_role
USING (true)
WITH CHECK (true);
