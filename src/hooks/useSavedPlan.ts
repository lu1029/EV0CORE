import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface SavedPlan {
  id: string;
  type: string;
  plan_name: string;
  description: string;
  plan_data: any;
  created_at: string;
  updated_at: string;
}

export function useSavedPlan(type: string) {
  const { user } = useApp();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("generated_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setPlan(data as SavedPlan);
      }
    } catch (err) {
      console.error("Error loading plan:", err);
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const savePlan = useCallback(async (planName: string, description: string, planData: any) => {
    if (!user) return;
    try {
      if (plan) {
        // Update existing
        await supabase
          .from("generated_plans")
          .update({ plan_name: planName, description, plan_data: planData })
          .eq("id", plan.id);
        setPlan({ ...plan, plan_name: planName, description, plan_data: planData, updated_at: new Date().toISOString() });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("generated_plans")
          .insert({ user_id: user.id, type, plan_name: planName, description, plan_data: planData })
          .select()
          .single();
        if (!error && data) {
          setPlan(data as SavedPlan);
        }
      }
      toast.success("Plano salvo!");
    } catch (err) {
      console.error("Error saving plan:", err);
      toast.error("Erro ao salvar plano");
    }
  }, [user, plan, type]);

  const deletePlan = useCallback(async () => {
    if (!user || !plan) return;
    await supabase.from("generated_plans").delete().eq("id", plan.id);
    setPlan(null);
  }, [user, plan]);

  return { plan, loading, savePlan, deletePlan, setPlan };
}
