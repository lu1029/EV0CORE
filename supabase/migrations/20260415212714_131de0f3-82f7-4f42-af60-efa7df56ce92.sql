-- Attach the existing profiles_update_check function as a trigger
CREATE TRIGGER prevent_premium_self_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_update_check();