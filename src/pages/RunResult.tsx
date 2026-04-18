import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, Share2, Footprints, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e4429" }] },
];

let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { mapsPromise = null; reject(new Error("Failed to load Google Maps")); };
    document.head.appendChild(s);
  });
  return mapsPromise;
}

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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("runs").select("*").eq("id", id).single();
        if (error || !data) throw error;
        setRun(data);
      } catch {
        toast.error(t("running.loadError"));
        navigate("/corrida");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, t]);

  useEffect(() => {
    if (!run || !mapContainerRef.current) return;
    const points = (run.route_data as any)?.points as Array<{ lat: number; lng: number }> | undefined;
    if (!points || points.length < 2) return;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-maps-key");
        if (!data?.key) return;
        await loadGoogleMaps(data.key);
        const g = (window as any).google;
        if (!g?.maps || !mapContainerRef.current) return;
        const map = new g.maps.Map(mapContainerRef.current, {
          disableDefaultUI: true, styles: darkMapStyles, gestureHandling: "greedy",
        });
        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        new g.maps.Polyline({ path: points, map, strokeColor: "hsl(142, 71%, 45%)", strokeOpacity: 0.95, strokeWeight: 5 });
        new g.maps.Marker({
          position: points[0], map,
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
        });
        new g.maps.Marker({
          position: points[points.length - 1], map,
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
        });
        map.fitBounds(bounds, 40);
      } catch (e) { console.error(e); }
    })();
  }, [run]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }
  if (!run) return null;

  const activityLabel = t(`running.${ACTIVITY_LABELS[run.activity_type] ?? "activities_run"}`);
  const points = (run.route_data as any)?.points;
  const hasRoute = Array.isArray(points) && points.length > 1;
  const avgSpeed = run.avg_speed_kmh ?? (run.duration_seconds > 0 ? Number(run.distance_km) / (run.duration_seconds / 3600) : 0);

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate("/corrida")} className="flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </button>
        <h2 className="text-foreground font-heading font-bold text-base">{activityLabel}</h2>
        <button onClick={handleDelete} disabled={deleting} className="text-muted-foreground active:scale-95 transition-transform" aria-label="Delete">
          {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full h-72 relative bg-secondary">
        {hasRoute ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("running.routeUnavailable")}</p>
          </div>
        )}
      </div>

      <div className="px-4 mt-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Footprints className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-foreground font-heading font-bold text-sm">{activityLabel}</p>
              <p className="text-muted-foreground text-xs">
                {new Date(run.started_at).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {[
              { label: t("running.distance"), value: Number(run.distance_km).toFixed(2), unit: "km" },
              { label: t("running.time"), value: formatTime(run.duration_seconds), unit: "" },
              { label: t("running.pace"), value: formatPace(run.pace_min_km), unit: "/km" },
              { label: t("running.calories"), value: `${run.calories_burned ?? 0}`, unit: "kcal" },
              { label: t("running.avgSpeed"), value: Number(avgSpeed).toFixed(1), unit: "km/h" },
              { label: t("running.maxSpeed"), value: Number((run.route_data as any)?.max_speed_kmh ?? 0).toFixed(1), unit: "km/h" },
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
    </div>
  );
};

export default RunResult;
