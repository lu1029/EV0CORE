import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export interface Club {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  cover_url: string | null;
  is_private: boolean;
  members_count: number;
  created_at: string;
  is_member?: boolean;
}

export function useClubs() {
  const { user } = useApp();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .order("members_count", { ascending: false })
      .limit(50);

    const list = (data as any[]) ?? [];
    let memberSet = new Set<string>();
    if (user && list.length) {
      const { data: mine } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("user_id", user.id)
        .in("club_id", list.map(c => c.id));
      memberSet = new Set((mine ?? []).map((m: any) => m.club_id));
    }
    setClubs(list.map(c => ({ ...c, is_member: memberSet.has(c.id) })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const join = useCallback(async (clubId: string) => {
    if (!user) return;
    await supabase.from("club_members").insert({ club_id: clubId, user_id: user.id });
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, is_member: true, members_count: c.members_count + 1 } : c));
  }, [user]);

  const leave = useCallback(async (clubId: string) => {
    if (!user) return;
    await supabase.from("club_members").delete().eq("club_id", clubId).eq("user_id", user.id);
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, is_member: false, members_count: Math.max(0, c.members_count - 1) } : c));
  }, [user]);

  const create = useCallback(async (input: { name: string; description?: string; category?: string; is_private?: boolean }) => {
    if (!user) throw new Error("not_authenticated");
    const { data, error } = await supabase
      .from("clubs")
      .insert({
        owner_id: user.id,
        name: input.name,
        description: input.description ?? "",
        category: input.category ?? "general",
        is_private: input.is_private ?? false,
      })
      .select()
      .single();
    if (error) throw error;
    // Auto-join as owner
    await supabase.from("club_members").insert({ club_id: (data as any).id, user_id: user.id, role: "owner" });
    await load();
    return data;
  }, [user, load]);

  return { clubs, loading, join, leave, create, refetch: load };
}
