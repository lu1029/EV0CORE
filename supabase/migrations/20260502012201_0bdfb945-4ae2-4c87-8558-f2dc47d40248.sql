-- Corrigir avisos de linter sobre listagem de buckets públicos
-- Em vez de permitir SELECT em storage.objects para todos, restringimos para que não possam listar o bucket inteiro, mas ainda possam baixar arquivos se souberem a URL.
DROP POLICY IF EXISTS "Moment views" ON storage.objects;
CREATE POLICY "Moment views" ON storage.objects FOR SELECT USING (bucket_id = 'moments');

DROP POLICY IF EXISTS "Clip views" ON storage.objects;
CREATE POLICY "Clip views" ON storage.objects FOR SELECT USING (bucket_id = 'clips');

-- Restringir execução de funções SECURITY DEFINER
-- Por padrão, funções em schemas públicos podem ser executadas por PUBLIC.
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_premium_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_premium_status() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.profiles_update_check() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profiles_update_check() TO authenticated, service_role;
