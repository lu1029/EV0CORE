import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Play, Clock, Flame, TrendingUp, Trophy, Pause, Square,
  Navigation, ChevronRight, Share2, Save, ArrowLeft, Zap, Heart,
  Route, Timer, Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";

const mapStyle = { width: "100%", height: "100%" };
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

type RunPhase = "idle" | "running" | "summary";

interface Segment {
  startIdx: number;
  endIdx: number;
  distance: number;
  time: number;
  pace: string;
}

const RunningScreen = () => {
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [calories, setCalories] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState("Corrida");

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastSegmentDistRef = useRef(0);
  const lastSegmentTimeRef = useRef(0);
  const lastSegmentIdxRef = useRef(0);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCurrentPosition({ lat: -23.5505, lng: -46.6333 })
    );
  }, []);

  const haversine = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
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
    const pMin = Math.floor(paceS / 60);
    const pSec = Math.floor(paceS % 60);
    return `${pMin}:${pSec.toString().padStart(2, "0")}`;
  };

  const pace = formatPace(elapsedSeconds, distanceKm);

  const startRun = useCallback(() => {
    setPhase("running");
    setIsPaused(false);
    setRoutePath(currentPosition ? [currentPosition] : []);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setCalories(0);
    setSegments([]);
    setMaxSpeed(0);
    setElevationGain(Math.round(Math.random() * 30 + 10));
    lastSegmentDistRef.current = 0;
    lastSegmentTimeRef.current = 0;
    lastSegmentIdxRef.current = 0;

    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const speed = pos.coords.speed ?? 0;
        setCurrentPosition(newPos);
        setMaxSpeed((prev) => Math.max(prev, speed * 3.6));

        setRoutePath((prev) => {
          if (prev.length > 0) {
            const dist = haversine(prev[prev.length - 1], newPos);
            if (dist > 0.005) {
              setDistanceKm((d) => {
                const newD = d + dist;
                // Create segments every ~1km
                if (Math.floor(newD) > Math.floor(d) && Math.floor(newD) > 0) {
                  setElapsedSeconds((t) => {
                    const segDist = newD - lastSegmentDistRef.current;
                    const segTime = t - lastSegmentTimeRef.current;
                    setSegments((segs) => [...segs, {
                      startIdx: lastSegmentIdxRef.current,
                      endIdx: prev.length,
                      distance: segDist,
                      time: segTime,
                      pace: formatPace(segTime, segDist),
                    }]);
                    lastSegmentDistRef.current = newD;
                    lastSegmentTimeRef.current = t;
                    lastSegmentIdxRef.current = prev.length;
                    return t;
                  });
                }
                return newD;
              });
              setCalories((c) => c + Math.round(dist * 70));
              return [...prev, newPos];
            }
          }
          return prev.length === 0 ? [newPos] : prev;
        });
        mapRef.current?.panTo(newPos);
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, [currentPosition]);

  const stopRun = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("summary");
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      if (p) {
        timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
      return !p;
    });
  }, []);

  const discardRun = () => {
    setPhase("idle");
    setRoutePath([]);
    setDistanceKm(0);
    setElapsedSeconds(0);
    setCalories(0);
    setSegments([]);
  };

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  const fitRouteBounds = useCallback((map: google.maps.Map) => {
    if (routePath.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    routePath.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [routePath]);

  const avgSpeed = elapsedSeconds > 0 ? ((distanceKm / (elapsedSeconds / 3600)).toFixed(1)) : "0.0";

  const recentRuns = [
    { date: "14 Abr", distance: "5.2 km", time: "28:15", pace: "5:26/km", calories: 380 },
    { date: "12 Abr", distance: "3.8 km", time: "21:40", pace: "5:42/km", calories: 270 },
    { date: "10 Abr", distance: "7.1 km", time: "38:50", pace: "5:28/km", calories: 510 },
    { date: "8 Abr", distance: "4.5 km", time: "24:30", pace: "5:27/km", calories: 320 },
  ];

  const activities = ["Corrida", "Caminhada", "Bike", "Esteira", "Elíptico", "Escada"];

  // ─── POST-RUN SUMMARY (Strava style) ───
  if (phase === "summary") {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={discardRun} className="flex items-center gap-1 text-muted-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> Descartar
          </button>
          <h2 className="text-foreground font-heading font-bold text-base">{selectedActivity}</h2>
          <button className="text-muted-foreground">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Route map (large, Strava-style) */}
        <div className="w-full h-72 relative">
          {isLoaded && routePath.length > 0 ? (
            <GoogleMap
              mapContainerStyle={mapStyle}
              center={routePath[0]}
              zoom={14}
              onLoad={(map) => { onMapLoad(map); fitRouteBounds(map); }}
              options={{ disableDefaultUI: true, styles: darkMapStyles, zoomControl: false }}
            >
              <Polyline
                path={routePath}
                options={{ strokeColor: "#FF4500", strokeWeight: 5, strokeOpacity: 1 }}
              />
              {/* Start marker */}
              <Marker position={routePath[0]} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#22c55e",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }} />
              {/* End marker */}
              <Marker position={routePath[routePath.length - 1]} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Rota não disponível</p>
            </div>
          )}
        </div>

        {/* Save Route button */}
        <div className="px-4 -mt-5 relative z-10">
          <Button variant="hero" className="w-full h-12 rounded-xl text-base shadow-lg">
            <Save className="w-4 h-4 mr-2" /> Salvar Corrida
          </Button>
        </div>

        {/* Main stats */}
        <div className="px-4 mt-6">
          <div className="bg-card border border-border rounded-2xl p-5">
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
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Distância</p>
                <p className="text-2xl font-heading font-bold text-foreground">{distanceKm.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">km</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Tempo</p>
                <p className="text-2xl font-heading font-bold text-foreground">{formatTime(elapsedSeconds)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Pace médio</p>
                <p className="text-2xl font-heading font-bold text-foreground">{pace} <span className="text-sm font-normal text-muted-foreground">/km</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Calorias</p>
                <p className="text-2xl font-heading font-bold text-foreground">{calories} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Vel. máxima</p>
                <p className="text-2xl font-heading font-bold text-foreground">{maxSpeed.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">km/h</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Vel. média</p>
                <p className="text-2xl font-heading font-bold text-foreground">{avgSpeed} <span className="text-sm font-normal text-muted-foreground">km/h</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Ganho de elevação</p>
                <p className="text-2xl font-heading font-bold text-foreground">{elevationGain} <span className="text-sm font-normal text-muted-foreground">m</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">Cadência</p>
                <p className="text-2xl font-heading font-bold text-foreground">{distanceKm > 0 ? Math.round(160 + Math.random() * 20) : "--"} <span className="text-sm font-normal text-muted-foreground">spm</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Segments (like Strava splits) */}
        <div className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" /> Splits por quilômetro
            </h3>
            {segments.length > 0 ? (
              <div className="space-y-0">
                {/* Header */}
                <div className="grid grid-cols-4 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span>KM</span>
                  <span className="text-right">Dist</span>
                  <span className="text-right">Pace</span>
                  <span className="text-right">Tempo</span>
                </div>
                {segments.map((seg, i) => (
                  <div key={i} className="grid grid-cols-4 py-2.5 border-b border-border/50 items-center">
                    <span className="text-foreground font-medium text-sm">{i + 1}</span>
                    <span className="text-foreground text-sm text-right">{seg.distance.toFixed(2)} km</span>
                    <span className="text-foreground text-sm text-right font-medium">{seg.pace} /km</span>
                    <span className="text-muted-foreground text-sm text-right">{formatTime(seg.time)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs text-center py-3">Corra pelo menos 1 km para ver splits</p>
            )}
          </div>
        </div>

        {/* Elevation chart placeholder */}
        <div className="px-4 mt-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Elevação
            </h3>
            <div className="flex items-end gap-[2px] h-20">
              {Array.from({ length: 40 }, (_, i) => {
                const h = 20 + Math.sin(i * 0.3) * 15 + Math.random() * 10;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/40"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">0 km</span>
              <span className="text-[9px] text-muted-foreground">{distanceKm.toFixed(1)} km</span>
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
        {/* Live map (top half) */}
        <div className="w-full h-[45vh] relative">
          {isLoaded && currentPosition ? (
            <GoogleMap
              mapContainerStyle={mapStyle}
              center={currentPosition}
              zoom={16}
              onLoad={onMapLoad}
              options={{ disableDefaultUI: true, styles: darkMapStyles, zoomControl: false }}
            >
              {routePath.length > 1 && (
                <Polyline
                  path={routePath}
                  options={{ strokeColor: "#FF4500", strokeWeight: 4, strokeOpacity: 0.9 }}
                />
              )}
              <Marker position={currentPosition} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "hsl(142, 71%, 45%)",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 3,
              }} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Carregando mapa...</p>
            </div>
          )}
          {/* GPS badge */}
          <div className="absolute top-4 left-4 glass rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1 text-xs text-foreground">
              <Navigation className="w-3 h-3 text-primary" /> GPS ativo
            </div>
          </div>
          {/* Activity badge */}
          <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5">
            <span className="text-xs text-foreground">{selectedActivity}</span>
          </div>
        </div>

        {/* Stats panel (bottom half) */}
        <div className="flex-1 bg-card border-t border-border rounded-t-3xl -mt-4 relative z-10 px-6 pt-6 pb-8 flex flex-col items-center justify-between">
          {/* Distance hero */}
          <div className="text-center mb-4">
            <p className="text-6xl font-heading font-bold text-foreground tracking-tight">{distanceKm.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">quilômetros</p>
          </div>

          {/* Stats grid */}
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

          {/* Controls */}
          <div className="flex items-center gap-5">
            <button onClick={togglePause} className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center active:scale-95 transition-transform">
              {isPaused ? <Play className="w-7 h-7 text-foreground ml-0.5" /> : <Pause className="w-7 h-7 text-foreground" />}
            </button>
            <button onClick={stopRun} className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center active:scale-95 transition-transform shadow-lg">
              <Square className="w-8 h-8 text-destructive-foreground" />
            </button>
            <div className="w-16 h-16" /> {/* spacer for balance */}
          </div>
        </div>
      </div>
    );
  }

  // ─── IDLE / PRE-RUN ───
  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Corrida & Cardio</h1>

      {/* Map preview + start */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 animate-fade-in">
        <div className="w-full h-44 relative">
          {isLoaded && currentPosition ? (
            <GoogleMap
              mapContainerStyle={mapStyle}
              center={currentPosition}
              zoom={14}
              options={{ disableDefaultUI: true, styles: darkMapStyles, zoomControl: false }}
            >
              <Marker position={currentPosition} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "hsl(142, 71%, 45%)",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" /> Carregando localização...
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1">
            <div className="flex items-center gap-1 text-[10px] text-foreground">
              <Navigation className="w-3 h-3 text-primary" /> Sua localização
            </div>
          </div>
        </div>
        <div className="p-5 text-center">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
            <Play className="w-7 h-7 text-primary-foreground ml-0.5" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-1">Iniciar {selectedActivity.toLowerCase()}</h2>
          <p className="text-sm text-muted-foreground mb-4">GPS • Pace • Distância • Splits • Calorias</p>
          <Button variant="hero" className="w-full h-12 rounded-xl text-base" onClick={startRun}>
            Começar agora 🏃
          </Button>
        </div>
      </div>

      {/* Activity types */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {activities.map((a) => (
          <button
            key={a}
            onClick={() => setSelectedActivity(a)}
            className={`rounded-full px-4 py-2 text-xs whitespace-nowrap transition-all border ${
              selectedActivity === a
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/30"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Weekly stats */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 animate-fade-in">
        <h3 className="font-semibold text-foreground text-sm mb-3">Esta semana</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient font-heading">14.2</p>
            <p className="text-[10px] text-muted-foreground">km total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">3</p>
            <p className="text-[10px] text-muted-foreground">corridas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground font-heading">5:32</p>
            <p className="text-[10px] text-muted-foreground">pace médio</p>
          </div>
        </div>
        <div className="flex items-end gap-1 mt-4 h-16 justify-between px-2">
          {[4, 6, 3, 8, 5, 2, 7].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-sm transition-all ${i === 3 ? "gradient-primary" : "bg-secondary"}`} style={{ height: `${h * 7}px` }} />
              <span className="text-[8px] text-muted-foreground">{"STQQSSD"[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm">Recordes 🏆</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">12.5 km</p>
          <p className="text-[10px] text-muted-foreground">Maior distância</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">4:52/km</p>
          <p className="text-[10px] text-muted-foreground">Melhor pace</p>
        </div>
      </div>

      {/* History */}
      <h3 className="font-semibold text-foreground text-sm mb-3">Histórico</h3>
      <div className="space-y-3">
        {recentRuns.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{r.distance}</p>
                <p className="text-xs text-muted-foreground">{r.date} • {r.time} • {r.pace}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="w-3 h-3" /> {r.calories}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunningScreen;
