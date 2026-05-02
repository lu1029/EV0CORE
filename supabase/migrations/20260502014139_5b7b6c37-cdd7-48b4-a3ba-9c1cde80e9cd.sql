-- Ensure internal schema exists
CREATE SCHEMA IF NOT EXISTS internal;

-- Move Trigger Functions to internal schema
ALTER FUNCTION public.handle_new_user() SET SCHEMA internal;
ALTER FUNCTION internal.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.handle_new_user() FROM PUBLIC;

ALTER FUNCTION public.profiles_update_check() SET SCHEMA internal;
ALTER FUNCTION internal.profiles_update_check() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.profiles_update_check() FROM PUBLIC;

ALTER FUNCTION public.sync_premium_status() SET SCHEMA internal;
ALTER FUNCTION internal.sync_premium_status() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.sync_premium_status() FROM PUBLIC;

ALTER FUNCTION public.update_post_likes_count() SET SCHEMA internal;
ALTER FUNCTION internal.update_post_likes_count() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.update_post_likes_count() FROM PUBLIC;

ALTER FUNCTION public.update_post_comments_count() SET SCHEMA internal;
ALTER FUNCTION internal.update_post_comments_count() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.update_post_comments_count() FROM PUBLIC;

ALTER FUNCTION public.update_club_members_count() SET SCHEMA internal;
ALTER FUNCTION internal.update_club_members_count() SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.update_club_members_count() FROM PUBLIC;

-- Move RPC Functions to internal and create public wrappers
-- get_public_profile
ALTER FUNCTION public.get_public_profile(uuid) SET SCHEMA internal;
ALTER FUNCTION internal.get_public_profile(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.get_public_profile(uuid) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (user_id uuid, name text, avatar_url text)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM internal.get_public_profile(_user_id);
END;
$$;

-- get_public_profiles
ALTER FUNCTION public.get_public_profiles(uuid[]) SET SCHEMA internal;
ALTER FUNCTION internal.get_public_profiles(uuid[]) SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.get_public_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.get_public_profiles(uuid[]) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_public_profiles(_user_ids uuid[])
RETURNS TABLE (user_id uuid, name text, avatar_url text)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM internal.get_public_profiles(_user_ids);
END;
$$;

-- get_user_social_stats
ALTER FUNCTION public.get_user_social_stats(uuid) SET SCHEMA internal;
ALTER FUNCTION internal.get_user_social_stats(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION internal.get_user_social_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.get_user_social_stats(uuid) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_user_social_stats(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RETURN internal.get_user_social_stats(target_user_id);
END;
$$;

-- Fix storage policies
DROP POLICY IF EXISTS "Clip views" ON storage.objects;
DROP POLICY IF EXISTS "Moment views" ON storage.objects;
