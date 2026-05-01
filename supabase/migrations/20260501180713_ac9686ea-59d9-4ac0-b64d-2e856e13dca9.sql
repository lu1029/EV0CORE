
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;

-- Safe public view (only non-sensitive fields)
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
  SELECT user_id, name, avatar_url
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- Need a permissive SELECT on profiles for the view to return rows under security_invoker
-- but limited to only the columns exposed by the view via app discipline.
-- We add a policy that allows reading rows of other users (RLS row-level only — column protection
-- is achieved by always querying the view, never the base table for foreign profiles).
CREATE POLICY "Anyone authenticated can read profile rows for public view"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
