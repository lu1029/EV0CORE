-- 1. Create internal schema
CREATE SCHEMA IF NOT EXISTS internal;

-- 2. Define helper functions in internal schema
CREATE OR REPLACE FUNCTION internal.is_email_confirmed()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL);
$$;

CREATE OR REPLACE FUNCTION internal.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid AND environment = check_env
    AND (
      (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'active' AND cancel_at_period_end = true AND (current_period_end IS NULL OR current_period_end > now()))
    )
  );
$$;

CREATE OR REPLACE FUNCTION internal.is_club_member(_club_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.club_members WHERE club_id = _club_id AND user_id = _user_id);
$$;

-- 3. Update RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id AND internal.is_email_confirmed());

-- Clubs & Club Members
DROP POLICY IF EXISTS "Users can create clubs" ON public.clubs;
CREATE POLICY "Users can create clubs" ON public.clubs FOR INSERT WITH CHECK (auth.uid() = owner_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_members;
CREATE POLICY "Users can join clubs" ON public.club_members FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Anyone can view public clubs or members can view private" ON public.clubs;
CREATE POLICY "Anyone can view public clubs or members can view private" ON public.clubs FOR SELECT USING (is_private = false OR owner_id = auth.uid() OR internal.is_club_member(id, auth.uid()));

-- Social Interaction
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can follow others" ON public.user_follows;
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can post comments" ON public.post_comments;
CREATE POLICY "Users can post comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users save posts" ON public.post_saves;
CREATE POLICY "Users save posts" ON public.post_saves FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());

-- Club Posts
DROP POLICY IF EXISTS "Members can post in club" ON public.club_posts;
CREATE POLICY "Members can post in club" ON public.club_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed() AND internal.is_club_member(club_id, auth.uid()));

-- Workouts & Logs
DROP POLICY IF EXISTS "Users can create own templates" ON public.workout_templates;
CREATE POLICY "Users can create own templates" ON public.workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own workout logs" ON public.user_workout_logs;
CREATE POLICY "Users manage own workout logs" ON public.user_workout_logs FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own progress" ON public.progress_logs;
CREATE POLICY "Users manage own progress" ON public.progress_logs FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own workouts" ON public.workouts;
CREATE POLICY "Users manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own exercises" ON public.workout_exercises;
CREATE POLICY "Users manage own exercises" ON public.workout_exercises FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own plans" ON public.generated_plans;
CREATE POLICY "Users manage own plans" ON public.generated_plans FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());

-- Nutrition & Health
DROP POLICY IF EXISTS "Users manage own meals" ON public.meals;
CREATE POLICY "Users manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own water logs" ON public.water_logs;
CREATE POLICY "Users manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own food analyses" ON public.food_analyses;
CREATE POLICY "Users manage own food analyses" ON public.food_analyses FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());

-- Other logs/activity
DROP POLICY IF EXISTS "Users manage own runs" ON public.runs;
CREATE POLICY "Users manage own runs" ON public.runs FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users manage own checkins" ON public.daily_checkins;
CREATE POLICY "Users manage own checkins" ON public.daily_checkins FOR ALL USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id AND internal.is_email_confirmed());
DROP POLICY IF EXISTS "Users can create own posts" ON public.feed_posts;
CREATE POLICY "Users can create own posts" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND internal.is_email_confirmed());

-- 4. Storage Security
DROP POLICY IF EXISTS "Exercise images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Feed photos publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Food photos publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Club covers are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Email assets are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- 5. Finalize by removing public functions
DROP FUNCTION IF EXISTS public.is_email_confirmed() CASCADE;
DROP FUNCTION IF EXISTS public.has_active_subscription(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.is_club_member(uuid, uuid) CASCADE;
