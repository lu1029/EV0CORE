
-- 1) Achievements: restrict INSERT to service_role only
DROP POLICY IF EXISTS "Users manage own achievements" ON public.achievements;

CREATE POLICY "Users can view own achievements"
ON public.achievements
FOR SELECT
USING ((auth.uid() = user_id) AND is_email_confirmed());

CREATE POLICY "Service role manages achievements"
ON public.achievements
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2) Avatars storage: remove overly permissive public SELECT
DROP POLICY IF EXISTS "Avatars are viewable by direct path" ON storage.objects;
