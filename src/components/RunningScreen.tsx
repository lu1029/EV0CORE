import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Play, Clock, Flame, TrendingUp, Pause, Square,
  Navigation, Share2, Save, ArrowLeft, Zap,
  Route, Timer, Footprints, Loader2, WifiOff, LocateFixed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useRunHistory } from "@/hooks/useRunHistory";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { evaluateGpsPoint, accumulateElevation, type RawPoint } from "@/lib/gpsFilter";
import { ActivityModeTabs, type ActivityMode } from "@/components/running/ActivityModeTabs";
import { ActivityAnimationMode } from "@/components/running/ActivityAnimationMode";
import { ActivityPhotoMode } from "@/components/running/ActivityPhotoMode";
import { toast } from "sonner";

type RunPhase = "idle" | "running" | "summary";
type MapLoadState = "loading-key" | "loading-map" | "ready" | "error";

interface Segment {
  startIdx: number;
  endIdx: number;
  distance: number;
  time: number;
  pace: string;
}

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e4429" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2e1a" }] },
];

let mapsPromise: Promise<void> | null = null;
let mapsLoaded = false;

declare global {
  interface Window { google?: any; }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsLoaded) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { mapsLoaded = true; resolve(); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => { mapsLoaded = true; resolve(); };
    script.onerror = () => { mapsPromise = null; reject(new Error("Failed to load Google Maps")); };
    document.head.appendChild(script);
  });
  return mapsPromise;
}

const MapSkeleton = ({ message = "Carregando mapa..." }: { message?: string }) => (
  <div className="w-full h-full bg-secondary/80 flex flex-col items-center justify-center gap-3 animate-fade-in">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <MapPin className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

const MapError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="w-full h-full bg-secondary/80 flex flex-col items-center justify-center gap-3 animate-fade-in">
    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
      <WifiOff className="w-5 h-5 text-destructive" />
    </div>
    <p className="text-muted-foreground text-sm text-center px-4">{message}</p>
    <Button variant="glass" size="sm" onClick={onRetry} className="rounded-xl text-xs">Tentar novamente</Button>
  </div>
);

const RunningScreen = () => {
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [calories, setCalories] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState("Corrida");
  const [mapLoadState, setMapLoadState] = useState<MapLoadState>("loading-key");
  const [locationError, setLocationError] = useState("");

  const navigate = useNavigate();
  const { runs, loading: historyLoading, weekStats, refresh: refreshHistory } = useRunHistory();
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const lastSegmentDistRef = useRef(0);
  const lastSegmentTimeRef = useRef(0);
  const lastSegmentIdxRef = useRef(0);
  const apiKeyRef = useRef("");

  const initMap = useCallback(async () => {
    setMapLoadState("loading-key");
    setLocationError("");
    try {
      if (!apiKeyRef.current) {
        const { data } = await supabase.functions.invoke("get-maps-key");
        if (!data?.key) { setMapLoadState("error"); setLocationError("Chave do mapa não configurada"); return; }
        apiKeyRef.current = data.key;
      }
      setMapLoadState("loading-map");
      await loadGoogleMaps(apiKeyRef.current);
      setMapLoadState("ready");
    } catch {
      setMapLoadState("error");
      setLocationError("Erro ao carregar o mapa. Verifique sua conexão.");
    }
  }, []);

  useEffect(() => { initMap(); }, [initMap]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentPosition({ lat: -23.5505, lng: -46.6333 });
      setLocationError("Geolocalização não suportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setCurrentPosition({ lat: -23.5505, lng: -46.6333 });
        if (err.code === 1) setLocationError("Permita o acesso à localização nas configurações");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (mapLoadState !== "ready" || !currentPosition || !mapContainerRef.current || mapRef.current) return;
    const g = (window as any).google;
    if (!g?.maps) return;
    const map = new g.maps.Map(mapContainerRef.current, {
      center: currentPosition, zoom: phase === "running" ? 16 : 14,
      disableDefaultUI: true, styles: darkMapStyles, zoomControl: false, gestureHandling: "greedy",
    });
    new g.maps.Marker({
      position: currentPosition, map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "hsl(142, 71%, 45%)", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
    });
    mapRef.current = map;
  }, [mapLoadState, currentPosition, phase]);

  const recenterMap = useCallback(() => {
    if (mapRef.current && currentPosition) mapRef.current.panTo(currentPosition);
  }, [currentPosition]);

  const haversine = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatPace = (seconds: number, km: number) => {
    if (km <= 0) return "--:--";
    const paceS = seconds / km;
    return `${Math.floor(paceS / 60)}:${Math.floor(paceS % 60).toString().padStart(2, "0")}`;
  };

  const pace = formatPace(elapsedSeconds, distanceKm);
  const avgSpeed = elapsedSeconds > 0 ? ((distanceKm / (elapsedSeconds / 3600)).toFixed(1)) : "0.0";
  const activities = ["Corrida", "Caminhada", "Bike", "Esteira", "Elíptico", "Escada"];

  const lastRawPointRef = useRef<RawPoint | null>(null);
  const activityKeyMap: Record<string, string> = {
    "Corrida": "run", "Caminhada": "walk", "Bike": "bike",
    "Esteira": "treadmill", "Elíptico": "elliptical", "Escada": "stairs",
  };

  const startRun = useCallback(() => {
    setPhase("running");
    setIsPaused(false);
    setRoutePath(currentPosition ? [currentPosition] : []);
    setElapsedSeconds(0); setDistanceKm(0); setCalories(0); setSegments([]);
    setMaxSpeed(0); setElevationGain(0);
    lastSegmentDistRef.current = 0; lastSegmentTimeRef.current = 0; lastSegmentIdxRef.current = 0;
    lastRawPointRef.current = null;
    mapRef.current = null;
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    const activityKey = activityKeyMap[selectedActivity] ?? "run";

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: RawPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };
        const result = evaluateGpsPoint(lastRawPointRef.current, next, { activityType: activityKey });

        // Always update visible position so the user sees the cursor move
        setCurrentPosition({ lat: next.lat, lng: next.lng });
        mapRef.current?.panTo({ lat: next.lat, lng: next.lng });

        if (!result.accept) return;
        // Accept point — update route, distance, calories, elevation
        const newPoint = { lat: next.lat, lng: next.lng };
        setRoutePath((prev) => (prev.length === 0 ? [newPoint] : [...prev, newPoint]));
        if (lastRawPointRef.current) {
          setDistanceKm((d) => d + result.distanceKm);
          setCalories((c) => c + Math.round(result.distanceKm * 70));
          setMaxSpeed((m) => Math.max(m, result.speedKmh));
          setElevationGain((e) => accumulateElevation(e, result.elevationDeltaM));
        }
        lastRawPointRef.current = next;
      },
      (err) => { console.warn("watchPosition error:", err); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [currentPosition, selectedActivity]);

  const stopRun = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    mapRef.current = null;
    setPhase("summary");
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      if (p) timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      else if (timerRef.current) clearInterval(timerRef.current);
      return !p;
    });
  }, []);

  const discardRun = () => {
    mapRef.current = null;
    setPhase("idle"); setRoutePath([]); setDistanceKm(0); setElapsedSeconds(0); setCalories(0); setSegments([]);
    setSaved(false); setSaving(false);
  };

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const renderMap = (showControls = false) => {
    if (mapLoadState === "error") return <MapError message={locationError || "Erro ao carregar mapa"} onRetry={initMap} />;
    if (mapLoadState !== "ready" || !currentPosition) return <MapSkeleton message={mapLoadState === "loading-key" ? "Conectando..." : "Carregando mapa..."} />;
    return (
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />
        {showControls && (
          <button onClick={recenterMap} className="absolute bottom-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95 transition-transform">
            <LocateFixed className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>
    );
  };

  // ─── SUMMARY MAP (renders polyline of completed route) ───
  const summaryMapRef = useRef<HTMLDivElement>(null);
  const summaryMapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (phase !== "summary") { summaryMapInstanceRef.current = null; return; }
    if (mapLoadState !== "ready" || !summaryMapRef.current || routePath.length < 2) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    const bounds = new g.maps.LatLngBounds();
    routePath.forEach((p) => bounds.extend(p));

    const map = new g.maps.Map(summaryMapRef.current, {
      disableDefaultUI: true, styles: darkMapStyles, gestureHandling: "greedy", zoomControl: false,
    });
    new g.maps.Polyline({
      path: routePath, map,
      strokeColor: "hsl(142, 71%, 45%)", strokeOpacity: 0.95, strokeWeight: 5,
    });
    new g.maps.Marker({
      position: routePath[0], map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
      title: "Início",
    });
    new g.maps.Marker({
      position: routePath[routePath.length - 1], map,
      icon: { path: g.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
      title: "Fim",
    });
    map.fitBounds(bounds, 40);
    summaryMapInstanceRef.current = map;
  }, [phase, mapLoadState, routePath]);

  // ─── SAVE RUN TO DATABASE ───
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [summaryMode, setSummaryMode] = useState<ActivityMode>("map");
  const [summaryPhotoUrl, setSummaryPhotoUrl] = useState<string | null>(null);

  const saveRun = useCallback(async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const activityMap: Record<string, string> = {
        "Corrida": "run", "Caminhada": "walk", "Bike": "bike",
        "Esteira": "treadmill", "Elíptico": "elliptical", "Escada": "stairs",
      };

      const paceNum = distanceKm > 0 ? elapsedSeconds / 60 / distanceKm : null;
      const avgSpeedNum = elapsedSeconds > 0 ? distanceKm / (elapsedSeconds / 3600) : null;

      const { error } = await supabase.from("runs").insert({
        user_id: user.id,
        activity_type: activityMap[selectedActivity] ?? "run",
        distance_km: Number(distanceKm.toFixed(3)),
        duration_seconds: elapsedSeconds,
        calories_burned: calories,
        pace_min_km: paceNum ? Number(paceNum.toFixed(2)) : null,
        avg_speed_kmh: avgSpeedNum ? Number(avgSpeedNum.toFixed(2)) : null,
        route_data: { points: routePath, max_speed_kmh: maxSpeed, elevation_gain_m: elevationGain },
        started_at: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      });
      if (error) throw error;
      setSaved(true);
      refreshHistory();
    } catch (e) {
      console.error("Erro ao salvar corrida:", e);
      alert("Erro ao salvar corrida. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [saving, saved, distanceKm, elapsedSeconds, calories, selectedActivity, routePath, maxSpeed, elevationGain]);

  // ─── POST-RUN SUMMARY ───
  if (phase === "summary") {
    return (
      <div className="min-h-screen bg-background pb-24 animate-fade-in">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={discardRun} className="flex items-center gap-1 text-muted-foreground text-sm"><ArrowLeft className="w-4 h-4" /> Descartar</button>
          <h2 className="text-foreground font-heading font-bold text-base">{selectedActivity}</h2>
          <button className="text-muted-foreground"><Share2 className="w-5 h-5" /></button>
        </div>
        <div className="w-full h-72 relative bg-secondary">
          {routePath.length > 1 ? (
            <div ref={summaryMapRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Route className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">Rota não disponível</p>
              <p className="text-muted-foreground/70 text-xs">
                Sinal GPS fraco ou movimento insuficiente. Tente em ambiente externo com boa visada do céu.
              </p>
            </div>
          )}
        </div>
        <div className="px-4 -mt-5 relative z-10">
          <Button
            variant="hero"
            className="w-full h-12 rounded-xl text-base shadow-lg"
            onClick={saveRun}
            disabled={saving || saved}
          >
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>)
              : saved ? (<><Save className="w-4 h-4 mr-2" /> Salvo ✓</>)
              : (<><Save className="w-4 h-4 mr-2" /> Salvar {selectedActivity}</>)}
          </Button>
        </div>
        <div className="px-4 mt-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Footprints className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-foreground font-heading font-bold text-sm">{selectedActivity}</p>
                <p className="text-muted-foreground text-xs">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {[
                { label: "Distância", value: `${distanceKm.toFixed(2)}`, unit: "km" },
                { label: "Tempo", value: formatTime(elapsedSeconds), unit: "" },
                { label: "Pace médio", value: pace, unit: "/km" },
                { label: "Calorias", value: `${calories}`, unit: "kcal" },
                { label: "Vel. máxima", value: maxSpeed.toFixed(1), unit: "km/h" },
                { label: "Vel. média", value: avgSpeed, unit: "km/h" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value} {stat.unit && <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span>}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ACTIVE RUN ───
  if (phase === "running") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="w-full h-[45vh] relative">{renderMap(true)}
          <div className="absolute top-4 left-4 glass rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1 text-xs text-foreground"><Navigation className="w-3 h-3 text-primary" /> GPS ativo</div>
          </div>
          <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5">
            <span className="text-xs text-foreground">{selectedActivity}</span>
          </div>
        </div>
        <div className="flex-1 bg-card border-t border-border rounded-t-3xl -mt-4 relative z-10 px-6 pt-6 pb-8 flex flex-col items-center justify-between">
          <div className="text-center mb-4">
            <p className="text-6xl font-heading font-bold text-foreground tracking-tight">{distanceKm.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">quilômetros</p>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full max-w-sm mb-6">
            <div className="text-center">
              <Timer className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{formatTime(elapsedSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">Tempo</p>
            </div>
            <div className="text-center">
              <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{pace}</p>
              <p className="text-[10px] text-muted-foreground">Pace /km</p>
            </div>
            <div className="text-center">
              <Flame className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{calories}</p>
              <p className="text-[10px] text-muted-foreground">Calorias</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={togglePause} className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-95 transition-transform">
              {isPaused ? <Play className="w-7 h-7 text-foreground ml-0.5" /> : <Pause className="w-7 h-7 text-foreground" />}
            </button>
            <button onClick={stopRun} className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center active:scale-95 transition-transform shadow-lg">
              <Square className="w-8 h-8 text-destructive-foreground" />
            </button>
            <div className="w-16 h-16" />
          </div>
        </div>
      </div>
    );
  }

  // ─── IDLE / PRE-RUN (Clean first-time state) ───
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <AnimatedText as="h1" text="Corrida & Cardio" gradient className="text-2xl font-heading font-bold mb-6 block" />

      {/* Map + Start */}
      <div className="glass-card rounded-2xl overflow-hidden mb-6 animate-fade-in">
        <div className="w-full h-44 relative">
          {renderMap(true)}
          {locationError && mapLoadState !== "error" && (
            <div className="absolute bottom-3 left-3 right-3 glass rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-muted-foreground text-center">{locationError}</p>
            </div>
          )}
          {mapLoadState === "ready" && !locationError && (
            <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1">
              <div className="flex items-center gap-1 text-[10px] text-foreground">
                <Navigation className="w-3 h-3 text-primary" /> Sua localização
              </div>
            </div>
          )}
        </div>
        <div className="p-5 text-center">
          <button onClick={startRun}
            className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 animate-pulse-glow active:scale-95 transition-transform"
          >
            <Play className="w-7 h-7 text-primary-foreground ml-0.5" />
          </button>
          <h2 className="text-xl font-heading font-bold text-foreground mb-1">Iniciar {selectedActivity.toLowerCase()}</h2>
          <p className="text-sm text-muted-foreground mb-4">GPS • Pace • Distância • Calorias</p>
          <Button variant="hero" className="w-full h-12 rounded-xl text-base" onClick={startRun}>
            Começar agora 🏃
          </Button>
        </div>
      </div>

      {/* Activity types */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {activities.map((a) => (
          <button key={a} onClick={() => setSelectedActivity(a)}
            className={`rounded-full px-4 py-2 text-xs whitespace-nowrap transition-all border ${
              selectedActivity === a ? "bg-primary text-primary-foreground border-primary" : "glass-card text-foreground hover:border-primary/30"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Weekly stats */}
      <div className="glass-card rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-3">Esta semana</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient font-heading">{weekStats.totalKm.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">km total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">{weekStats.count}</p>
            <p className="text-[10px] text-muted-foreground">atividades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">
              {weekStats.avgPace
                ? `${Math.floor(weekStats.avgPace)}:${Math.round((weekStats.avgPace - Math.floor(weekStats.avgPace)) * 60).toString().padStart(2, "0")}`
                : "--:--"}
            </p>
            <p className="text-[10px] text-muted-foreground">pace médio</p>
          </div>
        </div>
      </div>

      {/* History */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Histórico</h3>
      {historyLoading ? (
        <div className="glass-card rounded-2xl p-6 flex items-center justify-center animate-fade-in">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center animate-fade-in">
          <MapPin className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade ainda</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Suas corridas e caminhadas aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {runs.map((r) => {
            const ptCount = (r.route_data as any)?.points?.length ?? 0;
            const paceStr = r.pace_min_km
              ? `${Math.floor(r.pace_min_km)}:${Math.round((r.pace_min_km - Math.floor(r.pace_min_km)) * 60).toString().padStart(2, "0")}/km`
              : "--";
            return (
              <button
                key={r.id}
                onClick={() => navigate(`/corrida/resultado/${r.id}`)}
                className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Footprints className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {Number(r.distance_km).toFixed(2)} km · {formatTime(r.duration_seconds)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {paceStr}{ptCount > 1 ? ` · ${ptCount}pts` : ""}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RunningScreen;
