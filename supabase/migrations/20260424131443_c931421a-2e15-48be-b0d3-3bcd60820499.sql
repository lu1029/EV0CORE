
-- Permitir que usuários criem seus próprios templates
ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE POLICY "Users can create own templates"
ON public.workout_templates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_email_confirmed());

CREATE POLICY "Users can update own templates"
ON public.workout_templates FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
ON public.workout_templates FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own template items"
ON public.workout_template_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.workout_templates t WHERE t.id = workout_template_id AND t.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.workout_templates t WHERE t.id = workout_template_id AND t.user_id = auth.uid()));
