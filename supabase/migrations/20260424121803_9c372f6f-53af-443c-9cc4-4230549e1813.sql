-- =========================================
-- WORKOUT TEMPLATES (catálogo curado)
-- =========================================
CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL CHECK (goal IN ('hipertrofia','emagrecimento','forca','condicionamento')),
  level TEXT NOT NULL CHECK (level IN ('iniciante','intermediario','avancado')),
  location_type TEXT NOT NULL CHECK (location_type IN ('casa','academia')),
  estimated_minutes INTEGER NOT NULL DEFAULT 45,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates"
  ON public.workout_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages templates"
  ON public.workout_templates FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_workout_templates_updated
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wt_location_goal ON public.workout_templates(location_type, goal);
CREATE INDEX idx_wt_level ON public.workout_templates(level);

-- =========================================
-- WORKOUT TEMPLATE ITEMS (exercícios do template)
-- =========================================
CREATE TABLE public.workout_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercise_library(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '10-12',
  rest_seconds INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view template items"
  ON public.workout_template_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages template items"
  ON public.workout_template_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_wti_template ON public.workout_template_items(workout_template_id, order_index);

-- =========================================
-- USER WORKOUT LOGS (sessão realizada)
-- =========================================
CREATE TABLE public.user_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workout logs"
  ON public.user_workout_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND public.is_email_confirmed())
  WITH CHECK (auth.uid() = user_id AND public.is_email_confirmed());

CREATE INDEX idx_uwl_user ON public.user_workout_logs(user_id, started_at DESC);

-- =========================================
-- USER SET LOGS (cada série)
-- =========================================
CREATE TABLE public.user_set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.user_workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercise_library(id) ON DELETE RESTRICT,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own set logs"
  ON public.user_set_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_workout_logs wl
      WHERE wl.id = workout_log_id AND wl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_workout_logs wl
      WHERE wl.id = workout_log_id AND wl.user_id = auth.uid()
    )
  );

CREATE INDEX idx_usl_log ON public.user_set_logs(workout_log_id);
CREATE INDEX idx_usl_exercise ON public.user_set_logs(exercise_id);