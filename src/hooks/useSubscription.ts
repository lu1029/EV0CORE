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
        .in("environment", [environment, "pix"])
        .in("status", ["active", "trialing", "canceled"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const now = new Date();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const isActive = !!subscription && (
    // Active/trialing AND (no end date OR end date in future) AND not cancel_at_period_end-without-end
    (["active", "trialing"].includes(subscription.status) &&
      (!subscription.cancel_at_period_end || (periodEnd && periodEnd > now)) &&
      (!periodEnd || periodEnd > now)) ||
    // Cancelled but still within paid period
    (subscription.status === "canceled" && periodEnd && periodEnd > now)
  );

  return { subscription, isActive, isLoading, refetch };
}
