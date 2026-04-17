
-- Helper: checks the currently authenticated user has confirmed their email
CREATE OR REPLACE FUNCTION public.is_email_confirmed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email_confirmed_at IS NOT NULL
  );
$$;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id AND public.is_email_confirmed());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id AND public.is_email_confirmed());

-- workouts
DROP POLICY IF EXISTS "Users manage own workouts" ON public.workouts;
CREATE POLICY "Users manage own workouts" ON public.workouts
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- workout_exercises
DROP POLICY IF EXISTS "Users manage own exercises" ON public.workout_exercises;
CREATE POLICY "Users manage own exercises" ON public.workout_exercises
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- generated_plans
DROP POLICY IF EXISTS "Users manage own plans" ON public.generated_plans;
CREATE POLICY "Users manage own plans" ON public.generated_plans
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- meals
DROP POLICY IF EXISTS "Users manage own meals" ON public.meals;
CREATE POLICY "Users manage own meals" ON public.meals
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- water_logs
DROP POLICY IF EXISTS "Users manage own water logs" ON public.water_logs;
CREATE POLICY "Users manage own water logs" ON public.water_logs
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- runs
DROP POLICY IF EXISTS "Users manage own runs" ON public.runs;
CREATE POLICY "Users manage own runs" ON public.runs
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- progress_logs
DROP POLICY IF EXISTS "Users manage own progress" ON public.progress_logs;
CREATE POLICY "Users manage own progress" ON public.progress_logs
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

-- achievements
DROP POLICY IF EXISTS "Users manage own achievements" ON public.achievements;
CREATE POLICY "Users manage own achievements" ON public.achievements
  FOR ALL USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());
