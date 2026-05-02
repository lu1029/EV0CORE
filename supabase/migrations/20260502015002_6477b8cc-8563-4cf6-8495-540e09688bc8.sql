-- Função para atualizar o status is_premium no perfil baseado na assinatura
CREATE OR REPLACE FUNCTION public.sync_user_premium_status()
RETURNS TRIGGER AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    -- Verifica se o usuário tem alguma assinatura ativa ou trialing que não expirou
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
    ) INTO is_active;

    UPDATE public.profiles
    SET is_premium = is_active,
        updated_at = now()
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para quando uma assinatura é criada ou atualizada
DROP TRIGGER IF EXISTS on_subscription_change ON public.subscriptions;
CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_premium_status();

-- Função para exclusão (caso ocorra)
DROP TRIGGER IF EXISTS on_subscription_delete ON public.subscriptions;
CREATE TRIGGER on_subscription_delete
AFTER DELETE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_premium_status();

-- RPC para verificação forçada/em tempo real
CREATE OR REPLACE FUNCTION public.check_premium_status(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = target_user_id
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
    ) INTO is_active;
    
    RETURN is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
