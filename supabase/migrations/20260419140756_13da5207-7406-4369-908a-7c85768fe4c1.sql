-- Biblioteca de exercícios em cache (preenchida pela edge function /exercises)
CREATE TABLE public.exercise_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL,
  name text NOT NULL,
  body_part text,
  target text,
  equipment text,
  gif_url text,
  secondary_muscles jsonb DEFAULT '[]'::jsonb,
  instructions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_library_body_part ON public.exercise_library(body_part);
CREATE INDEX idx_exercise_library_target ON public.exercise_library(target);
CREATE INDEX idx_exercise_library_name ON public.exercise_library(name);

ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- Leitura pública para usuários autenticados (catálogo compartilhado)
CREATE POLICY "Authenticated users can read exercise library"
ON public.exercise_library FOR SELECT
TO authenticated
USING (true);

-- Apenas service role escreve (via edge function)
CREATE POLICY "Service role manages exercise library"
ON public.exercise_library FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_exercise_library_updated_at
BEFORE UPDATE ON public.exercise_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();