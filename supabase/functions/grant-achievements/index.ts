// Server-side achievement granter. Computes user stats from authoritative tables
// and inserts only achievements the user has actually earned. Prevents users
// from awarding themselves arbitrary achievements via direct DB writes.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Stats {
  totalWorkouts: number;
  streak: number;
  totalVolume: number;
  totalRuns: number;
  totalDistanceKm: number;
}

const ACHIEVEMENT_DEFS: Array<{
  key: string;
  description: string;
  icon: string;
  check: (s: Stats) => boolean;
}> = [
  { key: "first_workout", description: "Complete seu primeiro treino", icon: "🎯", check: (s) => s.totalWorkouts >= 1 },
  { key: "5_workouts", description: "Complete 5 treinos", icon: "💪", check: (s) => s.totalWorkouts >= 5 },
  { key: "10_workouts", description: "Complete 10 treinos", icon: "🏋️", check: (s) => s.totalWorkouts >= 10 },
  { key: "25_workouts", description: "Complete 25 treinos", icon: "⚡", check: (s) => s.totalWorkouts >= 25 },
  { key: "50_workouts", description: "Complete 50 treinos", icon: "🔥", check: (s) => s.totalWorkouts >= 50 },
  { key: "100_workouts", description: "Complete 100 treinos", icon: "👑", check: (s) => s.totalWorkouts >= 100 },
  { key: "streak_3", description: "3 dias consecutivos de treino", icon: "🔥", check: (s) => s.streak >= 3 },
  { key: "streak_7", description: "7 dias consecutivos de treino", icon: "🗓️", check: (s) => s.streak >= 7 },
  { key: "streak_14", description: "14 dias consecutivos", icon: "⭐", check: (s) => s.streak >= 14 },
  { key: "streak_30", description: "30 dias consecutivos", icon: "🏆", check: (s) => s.streak >= 30 },
  { key: "volume_500", description: "Levante 500kg de volume total", icon: "🪨", check: (s) => s.totalVolume >= 500 },
  { key: "volume_1000", description: "Levante 1.000kg de volume total", icon: "💎", check: (s) => s.totalVolume >= 1000 },
  { key: "volume_5000", description: "Levante 5.000kg de volume total", icon: "🚀", check: (s) => s.totalVolume >= 5000 },
  { key: "volume_10000", description: "Levante 10.000kg de volume total", icon: "🌟", check: (s) => s.totalVolume >= 10000 },
  { key: "run_first", description: "Complete sua primeira corrida", icon: "🏃", check: (s) => s.totalRuns >= 1 },
  { key: "run_10km", description: "Corra 10km no total", icon: "🛤️", check: (s) => s.totalDistanceKm >= 10 },
  { key: "run_42km", description: "Corra 42km no total", icon: "🏅", check: (s) => s.totalDistanceKm >= 42 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller's identity using their JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    // Use service role for authoritative reads + writes.
    const admin = createClient(supabaseUrl, serviceKey);

    const [unlockedRes, workoutsRes, exercisesRes, runsRes] = await Promise.all([
      admin.from("achievements").select("name, unlocked_at").eq("user_id", userId),
      admin.from("workouts").select("completed_at").eq("user_id", userId).eq("completed", true),
      admin.from("workout_exercises").select("sets, reps, weight_kg").eq("user_id", userId),
      admin.from("runs").select("distance_km").eq("user_id", userId),
    ]);

    const unlockedMap = new Map<string, string>();
    (unlockedRes.data || []).forEach((a: any) => unlockedMap.set(a.name, a.unlocked_at));

    const workouts = workoutsRes.data || [];
    const exercises = exercisesRes.data || [];
    const runs = runsRes.data || [];

    const totalWorkouts = workouts.length;
    const totalVolume = exercises.reduce((a: number, e: any) => a + (e.sets || 0) * (e.reps || 0) * (Number(e.weight_kg) || 0), 0);
    const totalDistanceKm = runs.reduce((a: number, r: any) => a + (Number(r.distance_km) || 0), 0);
    const totalRuns = runs.length;

    const uniqueDates = new Set<string>();
    workouts.forEach((w: any) => { if (w.completed_at) uniqueDates.add(new Date(w.completed_at).toISOString().slice(0, 10)); });
    const today = new Date().toISOString().slice(0, 10);
    let streak = 0;
    const d = new Date();
    if (!uniqueDates.has(today)) d.setDate(d.getDate() - 1);
    while (uniqueDates.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
    if (uniqueDates.has(today)) streak = Math.max(streak, 1);

    const stats: Stats = { totalWorkouts, streak, totalVolume, totalRuns, totalDistanceKm };

    const newRows = ACHIEVEMENT_DEFS
      .filter((def) => def.check(stats) && !unlockedMap.has(def.key))
      .map((def) => ({ user_id: userId, name: def.key, description: def.description, icon: def.icon }));

    if (newRows.length > 0) {
      await admin.from("achievements").insert(newRows);
    }

    return new Response(JSON.stringify({ unlocked: newRows.map((r) => r.name) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("grant-achievements error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
