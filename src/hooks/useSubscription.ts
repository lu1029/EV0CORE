import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export function useSubscription() {
  const { user } = useApp();
  const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
  const environment = clientToken?.startsWith('pk_test_') ? 'sandbox' : 'live';

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ["subscription", user?.id, environment],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", environment)
        .in("status", ["active", "trialing", "canceled"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isActive = !!subscription && (
    (["active", "trialing"].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())) ||
    (subscription.status === "canceled" &&
      subscription.current_period_end && new Date(subscription.current_period_end) > new Date())
  );

  return { subscription, isActive, isLoading, refetch };
}
