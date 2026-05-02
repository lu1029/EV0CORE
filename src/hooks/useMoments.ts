import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";

export interface Moment {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  author?: { name: string; avatar_url: string | null };
}

export interface UserMoments {
  user_id: string;
  name: string;
  avatar_url: string | null;
  moments: Moment[];
  hasUnseen?: boolean;
}

const MOMENTS_EVENT = "evocore:moments:changed";

export function useMoments() {
  const { user } = useApp();
  const [userMoments, setUserMoments] = useState<UserMoments[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch non-expired moments
    const { data: rawMoments, error } = await supabase
      .from("moments")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading moments:", error);
      setLoading(false);
      return;
    }

    const list = (rawMoments as any[]) ?? [];
    if (list.length === 0) {
      setUserMoments([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(list.map(m => m.user_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", userIds);
    
    const profileMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p]));

    // Group moments by user
    const grouped = new Map<string, UserMoments>();

    list.forEach(m => {
      const profile = profileMap.get(m.user_id);
      const name = profile?.name || "Atleta";
      const avatar_url = profile?.avatar_url || null;

      if (!grouped.has(m.user_id)) {
        grouped.set(m.user_id, {
          user_id: m.user_id,
          name,
          avatar_url,
          moments: [],
        });
      }
      grouped.get(m.user_id)!.moments.push({
        ...m,
        author: { name, avatar_url }
      });
    });

    // Convert map to array and sort: current user first, then by latest moment
    const sorted = Array.from(grouped.values()).sort((a, b) => {
      if (user && a.user_id === user.id) return -1;
      if (user && b.user_id === user.id) return 1;
      const aLatest = new Date(a.moments[a.moments.length - 1].created_at).getTime();
      const bLatest = new Date(b.moments[b.moments.length - 1].created_at).getTime();
      return bLatest - aLatest;
    });

    setUserMoments(sorted);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    const onChanged = () => load();

    window.addEventListener(MOMENTS_EVENT, onChanged);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    
    return () => {
      window.removeEventListener(MOMENTS_EVENT, onChanged);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const createMoment = useCallback(async (media_url: string, media_type: "image" | "video" = "image") => {
    if (!user) throw new Error("not_authenticated");

    const { data, error } = await supabase
      .from("moments")
      .insert({
        user_id: user.id,
        media_url,
        media_type,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    window.dispatchEvent(new CustomEvent(MOMENTS_EVENT));
    return data;
  }, [user]);

  return { userMoments, loading, refetch: load, createMoment };
}
