-- Add visibility column to feed_posts
CREATE TYPE public.post_visibility AS ENUM ('public', 'followers', 'private');

ALTER TABLE public.feed_posts
  ADD COLUMN visibility public.post_visibility NOT NULL DEFAULT 'public';

CREATE INDEX idx_feed_posts_visibility ON public.feed_posts(visibility);

-- Replace the broad SELECT policy with a visibility-aware one
DROP POLICY IF EXISTS "Anyone authenticated can view feed posts" ON public.feed_posts;

CREATE POLICY "View posts based on visibility"
ON public.feed_posts
FOR SELECT
TO authenticated
USING (
  -- The author can always see their own posts
  auth.uid() = user_id
  -- Public posts are visible to everyone authenticated
  OR visibility = 'public'
  -- Followers-only: visible if the viewer follows the author
  OR (
    visibility = 'followers'
    AND EXISTS (
      SELECT 1 FROM public.user_follows uf
      WHERE uf.follower_id = auth.uid()
        AND uf.following_id = feed_posts.user_id
    )
  )
);
