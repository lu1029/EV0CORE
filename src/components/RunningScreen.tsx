import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Play, Clock, Flame, TrendingUp, Trophy, Pause, Square, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyDkov6OafPdEUhiWny_F5tC2zkcEKkUEFo";

const mapContainerStyle = { width: "100%", height: "100%" };
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

const RunningScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [calories, setCalories] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Get initial position
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCurrentPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCurrentPosition({ lat: -23.5505, lng: -46.6333 }) // São Paulo fallback
    );
  }, []);

  const calculateDistance = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const startRun = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setRoutePath(currentPosition ? [currentPosition] : []);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setCalories(0);

    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPosition(newPos);
        setRoutePath((prev) => {
          if (prev.length > 0) {
            const dist = calculateDistance(prev[prev.length - 1], newPos);
            if (dist > 0.005) {
              setDistanceKm((d) => d + dist);
              setCalories((c) => c + Math.round(dist * 70));
              return [...prev, newPos];
            }
          }
          return prev.length === 0 ? [newPos] : prev;
        });
        mapRef.current?.panTo(newPos);
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  }, [currentPosition]);

  const stopRun = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
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

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const pace = distanceKm > 0 ? `${Math.floor(elapsedSeconds / 60 / distanceKm)}:${((elapsedSeconds / distanceKm) % 60 | 0).toString().padStart(2, "0")}` : "--:--";

  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  const recentRuns = [
    { date: "14 Abr", distance: "5.2 km", time: "28:15", pace: "5:26/km", calories: 380 },
    { date: "12 Abr", distance: "3.8 km", time: "21:40", pace: "5:42/km", calories: 270 },
    { date: "10 Abr", distance: "7.1 km", time: "38:50", pace: "5:28/km", calories: 510 },
    { date: "8 Abr", distance: "4.5 km", time: "24:30", pace: "5:27/km", calories: 320 },
  ];

  if (isRunning) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        {/* Live Map */}
        <div className="w-full h-64 rounded-2xl mb-8 relative overflow-hidden border border-border">
          {isLoaded && currentPosition ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentPosition}
              zoom={16}
              onLoad={onMapLoad}
              options={{ disableDefaultUI: true, styles: darkMapStyles, zoomControl: false }}
            >
              {routePath.length > 1 && (
                <Polyline
                  path={routePath}
                  options={{ strokeColor: "hsl(142, 71%, 45%)", strokeWeight: 4, strokeOpacity: 0.9 }}
                />
              )}
              <Marker position={currentPosition} icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "hsl(142, 71%, 45%)",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              }} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Carregando mapa...</p>
            </div>
          )}
          <div className="absolute top-4 left-4 glass rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1 text-xs text-foreground">
              <Navigation className="w-3 h-3 text-primary" /> GPS ativo
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-6xl font-heading font-bold text-foreground">{distanceKm.toFixed(2)}</p>
          <p className="text-muted-foreground text-sm">quilômetros</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-xs">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{formatTime(elapsedSeconds)}</p>
            <p className="text-[10px] text-muted-foreground">Tempo</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{pace}</p>
            <p className="text-[10px] text-muted-foreground">Pace</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{calories}</p>
            <p className="text-[10px] text-muted-foreground">Calorias</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={togglePause} className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            {isPaused ? <Play className="w-6 h-6 text-foreground" /> : <Pause className="w-6 h-6 text-foreground" />}
          </button>
          <button onClick={stopRun} className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
            <Square className="w-6 h-6 text-destructive-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Corrida & Cardio</h1>

      {/* Map preview */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 animate-fade-in">
        <div className="w-full h-40">
          {isLoaded && currentPosition ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
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
        </div>
        <div className="p-5 text-center">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
            <Play className="w-7 h-7 text-primary-foreground ml-0.5" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-1">Iniciar corrida</h2>
          <p className="text-sm text-muted-foreground mb-4">GPS • Pace • Distância • Calorias</p>
          <Button variant="hero" className="w-full h-12 rounded-xl text-base" onClick={startRun}>
            Começar agora 🏃
          </Button>
        </div>
      </div>

      {/* Activity types */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {["Corrida", "Caminhada", "Bike", "Esteira", "Elíptico", "Escada"].map((a) => (
          <span key={a} className="bg-card border border-border rounded-full px-4 py-2 text-xs text-foreground whitespace-nowrap hover:border-primary/30 transition-all cursor-pointer">
            {a}
          </span>
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
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{r.distance}</p>
                <p className="text-xs text-muted-foreground">{r.date} • {r.time} • {r.pace}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3 h-3" /> {r.calories}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunningScreen;
