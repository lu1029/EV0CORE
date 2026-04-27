CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.exercises (
  id text PRIMARY KEY,
  name text NOT NULL,
  body_part text,
  target text,
  equipment text,
  gif_url text,
  instructions jsonb DEFAULT '[]'::jsonb,
  secondary_muscles jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages exercises"
  ON public.exercises FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_exercises_body_part ON public.exercises(body_part);
CREATE INDEX idx_exercises_target ON public.exercises(target);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_name_trgm ON public.exercises USING gin(name gin_trgm_ops);