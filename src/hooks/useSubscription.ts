import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";

export function useSubscription() {
  const { user } = useApp();
  const queryClient = useQueryClient();
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

  // Real-time verification via RPC if needed, and subscription to changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch, queryClient]);

  const now = new Date();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const isActive = !!subscription && (
    // Active/trialing AND (no end date OR end date in future)
    (["active", "trialing"].includes(subscription.status) &&
      (!periodEnd || periodEnd > now)) ||
    // Cancelled but still within paid period
    (subscription.status === "canceled" && periodEnd && periodEnd > now)
  );

  return { subscription, isActive, isLoading, refetch };
}

