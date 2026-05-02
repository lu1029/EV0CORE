CREATE OR REPLACE FUNCTION public.get_user_social_stats(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    followers_count INT;
    following_count INT;
    posts_count INT;
    is_following_val BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO followers_count FROM public.follows WHERE following_id = target_user_id;
    SELECT COUNT(*) INTO following_count FROM public.follows WHERE follower_id = target_user_id;
    SELECT COUNT(*) INTO posts_count FROM public.posts WHERE user_id = target_user_id;
    SELECT EXISTS(SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = target_user_id) INTO is_following_val;
    
    RETURN jsonb_build_object(
        'followers', followers_count,
        'following', following_count,
        'posts', posts_count,
        'is_following', is_following_val
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_user_social_stats(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_social_stats(UUID) TO authenticated;
