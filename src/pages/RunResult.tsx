import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, Share2, Footprints, Loader2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ActivityModeTabs, type ActivityMode } from "@/components/running/ActivityModeTabs";
import { ActivityMapMode } from "@/components/running/ActivityMapMode";
import { ActivityAnimationMode } from "@/components/running/ActivityAnimationMode";
import { ActivityPhotoMode } from "@/components/running/ActivityPhotoMode";
import { ShareCard } from "@/components/running/ShareCard";
import { PublishRunSheet } from "@/components/running/PublishRunSheet";

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
      // Wait one frame for the hidden card to render
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

      // Try native share with file
      const nav = navigator as any;
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "EvoCore", text: `${distanceKm.toFixed(2)} km · ${activityLabel}` });
      } else {
        // Fallback: download
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }
  if (!run) return null;

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => navigate("/corrida")}
          className="flex items-center gap-1 text-muted-foreground text-sm active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </button>
        <h2 className="text-foreground font-heading font-bold text-base">{activityLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPublishOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary active:scale-95 transition-transform"
            aria-label="Publicar no feed"
            title="Publicar no feed"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
            aria-label="Compartilhar"
          >
            {sharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
            aria-label="Excluir"
          >
            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <ActivityModeTabs mode={mode} onChange={setMode} hasPhoto={!!photoUrl} />

      {/* Mode viewport */}
      <div className="relative w-full h-80 mt-3 bg-secondary overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            {mode === "map" && (
              hasRoute ? (
                <ActivityMapMode points={points} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
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
      </div>

      {/* Stats card */}
      <div className="px-4 mt-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Footprints className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-foreground font-heading font-bold text-sm">{activityLabel}</p>
              <p className="text-muted-foreground text-xs">{dateString}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {[
              { label: t("running.distance", "Distância"), value: distanceKm.toFixed(2), unit: "km" },
              { label: t("running.time", "Tempo"), value: durationFormatted, unit: "" },
              { label: t("running.pace", "Pace"), value: paceFormatted, unit: "/km" },
              { label: t("running.calories", "Calorias"), value: `${calories}`, unit: "kcal" },
              { label: t("running.avgSpeed", "Vel. média"), value: Number(avgSpeed).toFixed(1), unit: "km/h" },
              { label: t("running.elevation", "Elevação"), value: `${Math.round(elevationGain)}`, unit: "m" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-2xl font-heading font-bold text-foreground">
                  {s.value} {s.unit && <span className="text-sm font-normal text-muted-foreground">{s.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

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

export default RunResult;
