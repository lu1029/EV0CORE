
-- Public profile view exposing only safe fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
  SELECT user_id, name, avatar_url, created_at
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;
