
DROP VIEW IF EXISTS public.public_profiles;

-- Allow authenticated users to read basic public info from any profile
-- (only safe fields will be selected by the app via column-level discipline).
CREATE POLICY "Authenticated users can view public profile info"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
