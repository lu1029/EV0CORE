import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export type WeekDay = "segunda" | "terça" | "quarta" | "quinta" | "sexta" | "sábado" | "domingo";

export function useActiveWorkoutPlan() {
  const { user } = useApp();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchActivePlan = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_workout_plans")
      .select(`
        *,
        template:workout_templates(*)
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error) setActivePlan(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivePlan();
  }, [user]);

  const setActiveTemplate = async (templateId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("user_workout_plans")
      .upsert({ 
        user_id: user.id, 
        template_id: templateId,
        is_custom: false,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    fetchActivePlan();
  };

  return { activePlan, loading, setActiveTemplate, refetch: fetchActivePlan };
}
