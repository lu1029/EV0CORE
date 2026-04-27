import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Play, Pause, RotateCcw, Lock, LockOpen, Box, Square, SkipBack } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { LatLng } from "@/lib/routePolyline";
import { ElevationChart } from "./ElevationChart";

// Strava-inspired dark map style
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6478" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2236" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f1a2a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2236" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#222c44" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070d18" }] },
];

/** Compass bearing in degrees from point a to point b (0=N, 90=E). */
function bearingBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Smallest signed delta to rotate from `from` to `to` (-180..180). */
function shortestAngleDelta(from: number, to: number): number {
  let d = ((to - from + 540) % 360) - 180;
  return d;
}

let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      mapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(s);
  });
  return mapsPromise;
}

interface Props {
  points: LatLng[];
  distanceKm?: number;
  durationSeconds?: number;
  paceMinKm?: number | null;
  elevationGainM?: number;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const formatPace = (paceMinKm: number) => {
  if (!paceMinKm || paceMinKm <= 0) return "--:--";
  const m = Math.floor(paceMinKm);
  const s = Math.round((paceMinKm - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const ActivityAnimationMode = ({
  points,
  distanceKm = 0,
  durationSeconds = 0,
  paceMinKm = null,
  elevationGainM = 0,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const glowRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const tRef = useRef(0); // logical playback cursor 0..1
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const prevHeadingRef = useRef<number | null>(null);
  const boundsRef = useRef<any>(null);
  const followCamRef = useRef(true);
  const userInteractingRef = useRef(false);
  const is3DRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [followCam, setFollowCam] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  // Animated counters tied to progress
  const distMV = useMotionValue(0);
  const timeMV = useMotionValue(0);
  const elevMV = useMotionValue(0);
  const distDisplay = useTransform(distMV, (v) => v.toFixed(2));
  const timeDisplay = useTransform(timeMV, (v) => formatTime(v));
  const elevDisplay = useTransform(elevMV, (v) => Math.round(v).toString());

  // Init map + draw faint base path
  useEffect(() => {
    if (!containerRef.current || points.length < 2) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-maps-key");
        if (!data?.key || cancelled) return;
        await loadGoogleMaps(data.key);
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        if (!g?.maps) return;

        const map = new g.maps.Map(containerRef.current, {
          disableDefaultUI: true,
          styles: darkMapStyles,
          gestureHandling: "greedy",
          zoomControl: false,
          backgroundColor: "#0b1220",
          tilt: 0,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
        });
        mapRef.current = map;

        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        boundsRef.current = bounds;
        map.fitBounds(bounds, 50);

        // If user pans/zooms during playback, auto-unlock follow-cam
        const onUserGesture = () => {
          if (!followCamRef.current) return;
          // Ignore programmatic camera moves (we set the flag while panning)
          if (userInteractingRef.current) return;
          followCamRef.current = false;
          setFollowCam(false);
        };
        map.addListener("dragstart", onUserGesture);
        map.addListener("zoom_changed", () => {
          if (userInteractingRef.current) return;
          // zoom_changed fires on programmatic too, so only react during playback when not flagged
          if (followCamRef.current) {
            followCamRef.current = false;
            setFollowCam(false);
          }
        });

        // Faint base route (full path)
        new g.maps.Polyline({
          path: points,
          map,
          strokeColor: "#ff5a1f",
          strokeOpacity: 0.18,
          strokeWeight: 4,
          zIndex: 1,
        });

        // Animated glow + main polylines
        glowRef.current = new g.maps.Polyline({
          path: [],
          map,
          strokeColor: "#ff5a1f",
          strokeOpacity: 0.45,
          strokeWeight: 12,
          zIndex: 2,
        });
        polylineRef.current = new g.maps.Polyline({
          path: [],
          map,
          strokeColor: "#ff6a00",
          strokeOpacity: 1,
          strokeWeight: 5,
          zIndex: 3,
        });

        // Runner marker (orange dot with white halo)
        markerRef.current = new g.maps.Marker({
          position: points[0],
          map,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#ff6a00",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          zIndex: 4,
        });

        setReady(true);
        // Auto-play once ready
        setTimeout(() => startPlayback(), 400);
      } catch (e) {
        console.error("Animation mode error:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (animTimerRef.current) window.clearInterval(animTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const startPlayback = () => {
    if (!ready || playing) return;
    if (animTimerRef.current) window.clearInterval(animTimerRef.current);
    setPlaying(true);
    setProgress(0);

    // Animate counters in parallel (~5s)
    const DURATION = 5;
    animate(distMV, distanceKm, { duration: DURATION, ease: "easeOut" });
    animate(timeMV, durationSeconds, { duration: DURATION, ease: "easeOut" });
    animate(elevMV, elevationGainM, { duration: DURATION, ease: "easeOut" });

    // Zoom in for follow-cam if locked + apply 3D tilt
    if (followCamRef.current && mapRef.current) {
      userInteractingRef.current = true;
      mapRef.current.panTo(points[0]);
      mapRef.current.setZoom(is3DRef.current ? 18 : 17);
      mapRef.current.setTilt(is3DRef.current ? 67.5 : 0);
      // Initial heading: from start toward an early point
      if (is3DRef.current) {
        const lookAhead = points[Math.min(5, points.length - 1)];
        if (lookAhead) mapRef.current.setHeading(bearingBetween(points[0], lookAhead));
      } else {
        mapRef.current.setHeading(0);
      }
      setTimeout(() => {
        userInteractingRef.current = false;
      }, 300);
    }

    const total = points.length;
    const stepCount = Math.min(total, 120);
    const stepSize = Math.max(1, Math.floor(total / stepCount));
    const intervalMs = (DURATION * 1000) / stepCount;
    let i = 0;
    let prevHeading: number | null = null;

    animTimerRef.current = window.setInterval(() => {
      const prevI = i;
      i = Math.min(i + stepSize, total);
      const slice = points.slice(0, i);
      polylineRef.current?.setPath(slice);
      glowRef.current?.setPath(slice);
      const head = points[Math.min(i, total) - 1];
      if (head && markerRef.current) markerRef.current.setPosition(head);
      // Smooth follow-cam: panTo glides the camera
      if (head && followCamRef.current && mapRef.current) {
        userInteractingRef.current = true;
        mapRef.current.panTo(head);
        // 3D mode: rotate camera bearing to match direction of travel (smoothed)
        if (is3DRef.current) {
          // Use a small look-ahead window for stable bearing
          const aheadIdx = Math.min(total - 1, i + Math.max(2, stepSize));
          const from = points[Math.max(0, prevI - 1)];
          const to = points[aheadIdx];
          if (from && to && (from.lat !== to.lat || from.lng !== to.lng)) {
            const target = bearingBetween(from, to);
            // Smooth toward target by 35% of the shortest delta to avoid jitter
            const base = prevHeading ?? mapRef.current.getHeading?.() ?? target;
            const smoothed = (base + shortestAngleDelta(base, target) * 0.35 + 360) % 360;
            mapRef.current.setHeading(smoothed);
            prevHeading = smoothed;
          }
        }
        window.setTimeout(() => {
          userInteractingRef.current = false;
        }, intervalMs + 50);
      }
      setProgress(i / total);

      if (i >= total) {
        if (animTimerRef.current) window.clearInterval(animTimerRef.current);
        animTimerRef.current = null;
        setPlaying(false);
      }
    }, intervalMs) as unknown as number;
  };

  const replay = () => {
    if (!ready) return;
    if (animTimerRef.current) window.clearInterval(animTimerRef.current);
    distMV.set(0);
    timeMV.set(0);
    elevMV.set(0);
    polylineRef.current?.setPath([]);
    glowRef.current?.setPath([]);
    markerRef.current?.setPosition(points[0]);
    setProgress(0);
    setPlaying(false);
    setTimeout(() => startPlayback(), 100);
  };

  const toggleFollowCam = () => {
    const next = !followCamRef.current;
    followCamRef.current = next;
    setFollowCam(next);
    if (!mapRef.current) return;
    userInteractingRef.current = true;
    if (next) {
      // Re-engage follow: zoom back into the marker's current position
      const pos = markerRef.current?.getPosition?.();
      if (pos) {
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(17);
      }
    } else {
      // Unlocked: show the whole route again
      if (boundsRef.current) mapRef.current.fitBounds(boundsRef.current, 50);
    }
    setTimeout(() => {
      userInteractingRef.current = false;
    }, 400);
  };

  const toggle3D = () => {
    const next = !is3DRef.current;
    is3DRef.current = next;
    setIs3D(next);
    if (!mapRef.current) return;
    userInteractingRef.current = true;
    if (next) {
      mapRef.current.setTilt(67.5);
      // Set initial heading from current marker forward
      const pos = markerRef.current?.getPosition?.();
      if (pos) {
        // Find next nearby route point ahead of current to derive heading
        const cur = { lat: pos.lat(), lng: pos.lng() };
        // Use a point ~5 ahead in the path if possible
        const idx = Math.max(
          0,
          Math.floor(progress * (points.length - 1)),
        );
        const ahead = points[Math.min(points.length - 1, idx + 5)] ?? points[points.length - 1];
        if (ahead) mapRef.current.setHeading(bearingBetween(cur, ahead));
        if (followCamRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(18);
        }
      }
    } else {
      mapRef.current.setTilt(0);
      mapRef.current.setHeading(0);
      if (followCamRef.current) mapRef.current.setZoom(17);
    }
    setTimeout(() => {
      userInteractingRef.current = false;
    }, 400);
  };

  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Rota não disponível
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0b1220]">
      {/* Map fills the area */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top-right controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFollowCam}
          disabled={!ready}
          aria-pressed={followCam}
          aria-label={followCam ? "Destravar câmera" : "Travar câmera no marcador"}
          title={followCam ? "Câmera travada — segue o marcador" : "Câmera livre"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
            followCam
              ? "bg-[#ff6a00] border-[#ff8a00] text-white"
              : "bg-black/60 border-white/10 text-white"
          }`}
        >
          {followCam ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
          {followCam ? "Seguindo" : "Livre"}
        </button>
        <button
          type="button"
          onClick={toggle3D}
          disabled={!ready}
          aria-pressed={is3D}
          aria-label={is3D ? "Desativar visão 3D" : "Ativar visão 3D"}
          title={is3D ? "Visão 3D ativa" : "Visão 2D"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-semibold shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
            is3D
              ? "bg-white text-black border-white"
              : "bg-black/60 border-white/10 text-white"
          }`}
        >
          {is3D ? <Box className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          {is3D ? "3D" : "2D"}
        </button>
        <button
          type="button"
          onClick={replay}
          disabled={!ready}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {playing ? <Play className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
          {playing ? "Reproduzindo" : "Replay"}
        </button>
      </div>

      {/* Mini elevation chart synced with playback (only shown if altitude data exists) */}
      <div className="absolute bottom-[92px] left-3 right-3 z-10 px-2 py-1.5 rounded-lg bg-black/55 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] uppercase tracking-wider text-white/60">Elevação</span>
          <span className="text-[9px] text-white/50">{Math.round(elevationGainM)} m total</span>
        </div>
        <ElevationChart points={points as any} progress={progress} className="h-10 w-full" />
      </div>

      {/* Bottom progress bar (just above stats) */}
      <div className="absolute bottom-[84px] left-3 right-3 z-10 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff5a1f] to-[#ff8a00] transition-[width] duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Bottom stats overlay (live counters) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 pt-4 bg-gradient-to-t from-black/85 via-black/60 to-transparent">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">Distância</p>
            <p className="text-white font-heading font-bold text-lg leading-none">
              <motion.span>{distDisplay}</motion.span>
              <span className="text-xs font-normal text-white/70 ml-1">km</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">Tempo</p>
            <p className="text-white font-heading font-bold text-lg leading-none">
              <motion.span>{timeDisplay}</motion.span>
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">Elevação</p>
            <p className="text-white font-heading font-bold text-lg leading-none">
              <motion.span>{elevDisplay}</motion.span>
              <span className="text-xs font-normal text-white/70 ml-1">m</span>
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] text-white/50">Pace médio</p>
          <p className="text-white text-xs font-semibold">
            {formatPace(paceMinKm ?? 0)} <span className="text-white/60 font-normal">/km</span>
          </p>
        </div>
      </div>
    </div>
  );
};
