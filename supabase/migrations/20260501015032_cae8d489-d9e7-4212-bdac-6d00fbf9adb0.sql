-- 1. Fix Premium Workout Templates Bypass
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.workout_templates;
CREATE POLICY "Users can view non-premium or their premium templates" 
ON public.workout_templates 
FOR SELECT 
TO authenticated 
USING (is_premium = false OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()));

-- 2. Fix Premium Workout Template Items Bypass
DROP POLICY IF EXISTS "Authenticated users can view template items" ON public.workout_template_items;
CREATE POLICY "Users can view non-premium or their premium template items" 
ON public.workout_template_items 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.workout_templates t 
        WHERE t.id = workout_template_items.workout_template_id 
        AND (t.is_premium = false OR (SELECT is_premium FROM public.profiles WHERE user_id = auth.uid()))
    )
);

-- 3. Set avatars bucket to private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- 4. Move pg_trgm extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- 5. Restrict SECURITY DEFINER functions
-- Revoke execute from public for all identified functions
REVOKE EXECUTE ON FUNCTION public.is_email_confirmed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_premium_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.profiles_update_check() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_club_members_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Grant execute to authenticated where needed for RLS or UI
GRANT EXECUTE ON FUNCTION public.is_email_confirmed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) TO authenticated;

-- For triggers, they usually run as the owner (postgres), so they don't need explicit grants if they are already owned by postgres.
-- But to be safe and clear, we ensure they are usable by the roles that might trigger them if they are not just internal.
-- However, standard practice for Supabase SECURITY DEFINER is to keep them restricted.
