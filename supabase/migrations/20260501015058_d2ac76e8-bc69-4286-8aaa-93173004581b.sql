-- Revoke explicit execution privileges from anon role for SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.is_email_confirmed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_premium_status() FROM anon;
REVOKE EXECUTE ON FUNCTION public.profiles_update_check() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_club_members_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Revoke from authenticated for functions that shouldn't be called directly by them (only via triggers or internal logic)
REVOKE EXECUTE ON FUNCTION public.sync_premium_status() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.profiles_update_check() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_club_members_count() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Ensure authenticated can still call the ones needed for RLS
GRANT EXECUTE ON FUNCTION public.is_email_confirmed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
