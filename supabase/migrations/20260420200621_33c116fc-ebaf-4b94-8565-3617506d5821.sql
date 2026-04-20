-- Bucket público para imagens de exercícios geradas por IA
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer um pode VER (público para CDN)
CREATE POLICY "Exercise images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-images');

-- Apenas service role faz upload (via edge function)
CREATE POLICY "Service role can upload exercise images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'exercise-images');

-- Coluna para cachear URL da imagem gerada por IA na biblioteca
ALTER TABLE public.exercise_library
ADD COLUMN IF NOT EXISTS ai_image_url TEXT;

-- Tabela separada para cachear imagens geradas por nome livre (treinos da IA)
CREATE TABLE IF NOT EXISTS public.exercise_image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exercise_image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read exercise image cache"
ON public.exercise_image_cache FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage exercise image cache"
ON public.exercise_image_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_exercise_image_cache_name_key
ON public.exercise_image_cache (name_key);