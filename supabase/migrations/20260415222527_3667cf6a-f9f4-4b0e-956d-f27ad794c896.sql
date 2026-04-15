CREATE TABLE public.generated_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'gym',
  plan_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own plans"
ON public.generated_plans
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_generated_plans_updated_at
BEFORE UPDATE ON public.generated_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();