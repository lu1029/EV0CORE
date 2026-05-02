-- Corrigindo search_path para segurança
ALTER FUNCTION public.sync_user_premium_status() SET search_path = public;
ALTER FUNCTION public.check_premium_status(UUID) SET search_path = public;

-- Restringindo permissões de execução
REVOKE EXECUTE ON FUNCTION public.check_premium_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_premium_status(UUID) TO authenticated;

-- Revogar execução da função de trigger para o público (ela só deve ser chamada pelo sistema)
REVOKE EXECUTE ON FUNCTION public.sync_user_premium_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_user_premium_status() TO postgres;
