import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, Share2, Loader2, Send, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ActivityMapMode } from "@/components/running/ActivityMapMode";
import { ActivityAnimationMode } from "@/components/running/ActivityAnimationMode";
import { ActivityPhotoMode } from "@/components/running/ActivityPhotoMode";
import { ShareCard } from "@/components/running/ShareCard";
import { PublishRunSheet } from "@/components/running/PublishRunSheet";
import { RunStatsSheet } from "@/components/running/RunStatsSheet";
import type { ActivityMode } from "@/components/running/ActivityModeTabs";

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const formatPace = (paceMinKm: number | null) => {
  if (!paceMinKm || paceMinKm <= 0) return "--:--";
  const m = Math.floor(paceMinKm);
  const s = Math.round((paceMinKm - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const ACTIVITY_LABELS: Record<string, string> = {
  run: "activities_run", walk: "activities_walk", bike: "activities_bike",
  treadmill: "activities_treadmill", elliptical: "activities_elliptical", stairs: "activities_stairs",
};

const RunResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [run, setRun] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<ActivityMode>("map");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Load run + signed photo url
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("runs").select("*").eq("id", id).single();
        if (error || !data) throw error;
        setRun(data);

        if (data.photo_url) {
          const { data: signed } = await supabase.storage
            .from("activity-photos")
            .createSignedUrl(data.photo_url, 60 * 60 * 24);
          if (signed?.signedUrl) setPhotoUrl(signed.signedUrl);
        }
      } catch {
        toast.error(t("running.loadError"));
        navigate("/corrida");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, t]);

  const handleDelete = useCallback(async () => {
    if (!id || deleting) return;
    if (!confirm(t("running.deleteConfirm"))) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("runs").delete().eq("id", id);
      if (error) throw error;
      toast.success(t("running.deleted"));
      navigate("/corrida");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setDeleting(false);
    }
  }, [id, deleting, navigate, t]);

  const points = (run?.route_data as any)?.points ?? [];
  const hasRoute = Array.isArray(points) && points.length > 1;

  const ACTIVITY_FALLBACKS: Record<string, string> = {
    activities_run: "Corrida",
    activities_walk: "Caminhada",
    activities_bike: "Bike",
    activities_treadmill: "Esteira",
    activities_elliptical: "Elíptico",
    activities_stairs: "Escada",
  };
  const activityKey = run ? (ACTIVITY_LABELS[run.activity_type] ?? "activities_run") : "activities_run";
  const activityLabel = run ? t(`running.${activityKey}`, ACTIVITY_FALLBACKS[activityKey]) : "";
  const distanceKm = run ? Number(run.distance_km) : 0;
  const durationFormatted = run ? formatTime(run.duration_seconds) : "00:00";
  const paceFormatted = run ? formatPace(run.pace_min_km) : "--:--";
  const calories = run?.calories_burned ?? 0;
  const avgSpeed = run
    ? (run.avg_speed_kmh ?? (run.duration_seconds > 0 ? Number(run.distance_km) / (run.duration_seconds / 3600) : 0))
    : 0;
  const elevationGain = (run?.route_data as any)?.elevation_gain_m ?? 0;
  const dateString = run
    ? new Date(run.started_at).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })
    : "";

  const handleShare = useCallback(async () => {
    if (!run || sharing) return;
    setSharing(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (!shareCardRef.current) throw new Error("Card not ready");

      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: 1,
      });
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/png", 0.95)
      );
      const file = new File([blob], `evocore-${run.id}.png`, { type: "image/png" });

      const nav = navigator as any;
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "EvoCore", text: `${distanceKm.toFixed(2)} km · ${activityLabel}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evocore-${run.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error(e);
        toast.error("Não foi possível compartilhar");
      }
    } finally {
      setSharing(false);
    }
  }, [run, sharing, distanceKm, activityLabel]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }
  if (!run) return null;

  const COLLAPSED_SHEET_HEIGHT = 230;
  const BOTTOM_NAV_OFFSET = 0; // sheet sits above the bottom-nav (handled by AppLayout pb)

  const primaryStats = [
    { label: t("running.distance", "Distância"), value: distanceKm.toFixed(2), unit: "km" },
    { label: t("running.time", "Tempo"), value: durationFormatted },
    { label: t("running.pace", "Pace"), value: paceFormatted, unit: "/km" },
  ];
  const detailStats = [
    { label: t("running.calories", "Calorias"), value: `${calories}`, unit: "kcal" },
    { label: t("running.avgSpeed", "Vel. média"), value: Number(avgSpeed).toFixed(1), unit: "km/h" },
    { label: t("running.elevation", "Elevação"), value: `${Math.round(elevationGain)}`, unit: "m" },
    { label: t("running.distance", "Distância"), value: distanceKm.toFixed(2), unit: "km" },
    { label: t("running.time", "Tempo"), value: durationFormatted },
    { label: t("running.pace", "Pace"), value: paceFormatted, unit: "/km" },
  ];

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Fullscreen background: Map / Animation / Photo */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {mode === "map" && (
              hasRoute ? (
                <ActivityMapMode
                  points={points}
                  fitPadding={{ top: 120, right: 40, bottom: 280, left: 40 }}
                  showModeToggle={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-secondary">
                  {t("running.routeUnavailable")}
                </div>
              )
            )}
            {mode === "animation" && (
              <ActivityAnimationMode
                points={points}
                distanceKm={distanceKm}
                durationSeconds={run.duration_seconds}
                paceMinKm={run.pace_min_km}
                elevationGainM={elevationGain}
              />
            )}
            {mode === "photo" && (
              <ActivityPhotoMode
                runId={run.id}
                photoUrl={photoUrl}
                points={points}
                onPhotoChange={setPhotoUrl}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Top fade for header readability */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background/80 via-background/40 to-transparent" />
      </div>

      {/* Floating header (transparent) */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-3 pb-2 safe-top">
        <button
          onClick={() => navigate("/corrida")}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Mode switcher (map / animation / photo) */}
          <div className="relative">
            <button
              onClick={() => setModeMenuOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
              aria-label="Trocar visualização"
            >
              <Layers className="w-5 h-5" />
            </button>
            {modeMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-background/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1 overflow-hidden">
                {[
                  { key: "map" as ActivityMode, label: "Mapa" },
                  { key: "animation" as ActivityMode, label: "Animação" },
                  ...(photoUrl ? [{ key: "photo" as ActivityMode, label: "Foto" }] : [{ key: "photo" as ActivityMode, label: "Adicionar foto" }]),
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setMode(opt.key); setModeMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      mode === opt.key ? "bg-primary/20 text-primary" : "text-foreground hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setPublishOpen(true)}
            className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/30"
            aria-label="Publicar no feed"
            title="Publicar no feed"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Compartilhar"
          >
            {sharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Excluir"
          >
            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* EvoCore draggable stats sheet */}
      <RunStatsSheet
        activityLabel={activityLabel}
        dateString={dateString}
        primaryStats={primaryStats}
        detailStats={detailStats}
        collapsedHeight={COLLAPSED_SHEET_HEIGHT}
        bottomOffset={BOTTOM_NAV_OFFSET}
      />

      {/* Hidden share card (rendered offscreen for html2canvas) */}
      <ShareCard
        ref={shareCardRef}
        activityLabel={activityLabel}
        distanceKm={distanceKm}
        durationFormatted={durationFormatted}
        paceFormatted={paceFormatted}
        caloriesKcal={calories}
        date={dateString}
        photoUrl={photoUrl}
        points={points}
      />

      {/* Publish-to-feed sheet */}
      <PublishRunSheet
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        shareCardRef={shareCardRef}
        runId={run.id}
        activityLabel={activityLabel}
        distanceKm={distanceKm}
        durationFormatted={durationFormatted}
        paceFormatted={paceFormatted}
        caloriesKcal={calories}
        elevationGainM={elevationGain}
        existingPhotoUrl={photoUrl}
      />
    </div>
  );
};

export default RunResult;
