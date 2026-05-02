-- Enum para dias da semana
DO $$ BEGIN
    CREATE TYPE public.weekday AS ENUM ('segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Atualização de workout_templates para suportar dias da semana
ALTER TABLE public.workout_template_items 
ADD COLUMN IF NOT EXISTS day_of_week weekday;

-- 2. Tabela para o Plano Ativo do Usuário
CREATE TABLE IF NOT EXISTS public.user_workout_plans (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id uuid REFERENCES public.workout_templates(id) ON DELETE SET NULL,
    is_custom boolean DEFAULT false,
    custom_data jsonb DEFAULT '{}'::jsonb, -- Caso o usuário crie um split do zero
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workout plan" 
ON public.user_workout_plans FOR ALL 
USING (auth.uid() = user_id);

-- 3. Momentos (Stories)
CREATE TABLE IF NOT EXISTS public.moments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    media_type text DEFAULT 'image', -- 'image' ou 'video'
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-expired moments" 
ON public.moments FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Users manage own moments" 
ON public.moments FOR ALL 
USING (auth.uid() = user_id);

-- 4. Clipes (Vídeos Curtos)
CREATE TABLE IF NOT EXISTS public.clips (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url text NOT NULL,
    thumbnail_url text,
    caption text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clips viewable by everyone" 
ON public.clips FOR SELECT 
USING (true);

CREATE POLICY "Users manage own clips" 
ON public.clips FOR ALL 
USING (auth.uid() = user_id);

-- 5. Salvos (Unificado)
CREATE TABLE IF NOT EXISTS public.user_saved_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type text NOT NULL, -- 'post', 'clip', 'workout'
    item_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.user_saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saves" 
ON public.user_saved_items FOR ALL 
USING (auth.uid() = user_id);

-- 6. Buckets de Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('moments', 'moments', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('clips', 'clips', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true) ON CONFLICT DO NOTHING;

-- Políticas de Storage para Moments
CREATE POLICY "Moment uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'moments' AND auth.role() = 'authenticated');
CREATE POLICY "Moment views" ON storage.objects FOR SELECT USING (bucket_id = 'moments');

-- Políticas de Storage para Clips
CREATE POLICY "Clip uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clips' AND auth.role() = 'authenticated');
CREATE POLICY "Clip views" ON storage.objects FOR SELECT USING (bucket_id = 'clips');

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_moments_expires ON public.moments(expires_at);
CREATE INDEX IF NOT EXISTS idx_clips_user ON public.clips(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON public.user_saved_items(user_id);
