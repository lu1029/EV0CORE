-- Limpa cache antigo (RapidAPI sem gif_url)
DELETE FROM public.exercise_library WHERE gif_url IS NULL;