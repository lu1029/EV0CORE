-- Revoke EXECUTE from PUBLIC/anon/authenticated on trigger-only SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.sync_premium_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.profiles_update_check() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_club_members_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;