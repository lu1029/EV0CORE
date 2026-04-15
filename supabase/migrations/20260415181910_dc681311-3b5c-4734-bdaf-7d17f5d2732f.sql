
-- Create a function that prevents users from changing is_premium
CREATE OR REPLACE FUNCTION public.profiles_update_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from changing is_premium
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    NEW.is_premium := OLD.is_premium;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the restriction
CREATE TRIGGER enforce_profiles_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_update_check();
