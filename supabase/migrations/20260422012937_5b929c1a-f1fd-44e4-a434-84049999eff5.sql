
-- =========================================================
-- 1. CRIAR TODAS AS TABELAS PRIMEIRO (sem policies)
-- =========================================================

CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  cover_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  members_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);

CREATE TABLE public.club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  worked_out BOOLEAN NOT NULL DEFAULT false,
  ran BOOLEAN NOT NULL DEFAULT false,
  logged_meal BOOLEAN NOT NULL DEFAULT false,
  hit_calorie_goal BOOLEAN NOT NULL DEFAULT false,
  manual_checkin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE public.post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

-- =========================================================
-- 2. SECURITY DEFINER HELPER (evita recursão entre clubs/club_members)
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_club_member(_club_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = _club_id AND user_id = _user_id
  );
$$;

-- =========================================================
-- 3. RLS + POLICIES
-- =========================================================
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;

-- CLUBS
CREATE POLICY "View public or own clubs"
  ON public.clubs FOR SELECT TO authenticated
  USING (
    is_private = false
    OR owner_id = auth.uid()
    OR public.is_club_member(id, auth.uid())
  );

CREATE POLICY "Users can create clubs"
  ON public.clubs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND is_email_confirmed());

CREATE POLICY "Owner can update club"
  ON public.clubs FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete club"
  ON public.clubs FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- CLUB MEMBERS
CREATE POLICY "View memberships of accessible clubs"
  ON public.club_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs c
      WHERE c.id = club_members.club_id
      AND (c.is_private = false OR c.owner_id = auth.uid() OR public.is_club_member(c.id, auth.uid()))
    )
  );

CREATE POLICY "Users can join clubs"
  ON public.club_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_confirmed());

CREATE POLICY "Users can leave clubs"
  ON public.club_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CLUB POSTS
CREATE POLICY "Members can view club posts"
  ON public.club_posts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs c
      WHERE c.id = club_posts.club_id
      AND (c.is_private = false OR c.owner_id = auth.uid() OR public.is_club_member(c.id, auth.uid()))
    )
  );

CREATE POLICY "Members can post in club"
  ON public.club_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_email_confirmed()
    AND public.is_club_member(club_posts.club_id, auth.uid())
  );

CREATE POLICY "Author can delete own club post"
  ON public.club_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- DAILY CHECKINS
CREATE POLICY "Users manage own checkins"
  ON public.daily_checkins FOR ALL TO authenticated
  USING (auth.uid() = user_id AND is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND is_email_confirmed());

-- USER FOLLOWS
CREATE POLICY "Anyone authenticated can view follows"
  ON public.user_follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id AND is_email_confirmed());

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- POST SAVES
CREATE POLICY "Users view own saves"
  ON public.post_saves FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users save posts"
  ON public.post_saves FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_confirmed());

CREATE POLICY "Users unsave posts"
  ON public.post_saves FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- 4. INDEXES
-- =========================================================
CREATE INDEX idx_club_members_club ON public.club_members(club_id);
CREATE INDEX idx_club_members_user ON public.club_members(user_id);
CREATE INDEX idx_club_posts_club ON public.club_posts(club_id, created_at DESC);
CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- =========================================================
-- 5. TRIGGERS
-- =========================================================
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: manter members_count em sincronia
CREATE OR REPLACE FUNCTION public.update_club_members_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clubs SET members_count = members_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clubs SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_club_members_count
  AFTER INSERT OR DELETE ON public.club_members
  FOR EACH ROW EXECUTE FUNCTION public.update_club_members_count();

-- =========================================================
-- 6. STORAGE BUCKET para capas de clube
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-covers', 'club-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Club covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-covers');

CREATE POLICY "Authenticated users can upload club covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'club-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their club covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'club-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their club covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'club-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
