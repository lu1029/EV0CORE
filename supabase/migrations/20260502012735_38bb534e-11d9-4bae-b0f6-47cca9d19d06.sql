-- Limpa itens existentes para evitar duplicidade na geração automática
DELETE FROM public.workout_template_items;

-- Segunda: Peito e Triceps
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 4, '12', 60, 'segunda', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part IN ('chest', 'upper arms')
ORDER BY random()
LIMIT 50; -- Vai inserir 5 para cada template se usarmos uma lógica mais precisa, mas para MVP vamos popular geral

-- Terça: Costas e Biceps
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 4, '12', 60, 'terça', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part IN ('back', 'upper arms')
ORDER BY random()
LIMIT 50;

-- Quarta: Pernas
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 4, '15', 90, 'quarta', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part IN ('upper legs', 'lower legs')
ORDER BY random()
LIMIT 50;

-- Quinta: Ombros e Core
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 4, '12', 60, 'quinta', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part IN ('shoulders', 'waist')
ORDER BY random()
LIMIT 50;

-- Sexta: Full Body
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 3, '15', 45, 'sexta', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part IN ('chest', 'back', 'upper legs')
ORDER BY random()
LIMIT 50;

-- Sábado: Cardio
INSERT INTO public.workout_template_items (workout_template_id, exercise_id, sets, reps, rest_seconds, day_of_week, order_index)
SELECT t.id, e.id, 1, '20 min', 0, 'sábado', 1
FROM public.workout_templates t, public.exercise_library e
WHERE e.body_part = 'cardio'
ORDER BY random()
LIMIT 50;
