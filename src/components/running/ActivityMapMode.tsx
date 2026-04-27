import { useEffect, useRef, useState } from "react";
import { Box, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { LatLng } from "@/lib/routePolyline";

// Strava-inspired dark map: deep navy land, muted roads, dim labels
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
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a455c" }] },
];

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
  /** Padding (px) for fitBounds — useful when content overlays the map (top header / bottom sheet). */
  fitPadding?: number | { top: number; right: number; bottom: number; left: number };
  /** Show the 2D/3D toggle. Default true. */
  showModeToggle?: boolean;
  /** Position of the 2D/3D toggle. Default "top-right". */
  togglePosition?: "top-right" | "bottom-right";
}

export const ActivityMapMode = ({ points, fitPadding = 60, showModeToggle = true, togglePosition = "top-right" }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const animatedRef = useRef(false);
  const [is3D, setIs3D] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || points.length < 2) return;
    let cancelled = false;
    let drawTimer: number | null = null;

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
          heading: 0,
          mapTypeId: g.maps.MapTypeId.ROADMAP,
        });
        mapRef.current = map;

        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, fitPadding as any);

        // Outer glow polyline — indigo brand glow
        const glow = new g.maps.Polyline({
          path: [],
          map,
          strokeColor: "#6366f1",
          strokeOpacity: 0.35,
          strokeWeight: 14,
          zIndex: 1,
        });

        // Main bright indigo polyline
        const polyline = new g.maps.Polyline({
          path: [],
          map,
          strokeColor: "#818cf8",
          strokeOpacity: 1,
          strokeWeight: 5,
          zIndex: 2,
        });

        const drawComplete = (path: LatLng[]) => {
          glow.setPath(path);
          polyline.setPath(path);
        };

        if (!animatedRef.current) {
          animatedRef.current = true;
          let i = 0;
          const total = points.length;
          const stepSize = Math.max(1, Math.floor(total / 60));
          const tick = () => {
            if (cancelled) return;
            i = Math.min(i + stepSize, total);
            drawComplete(points.slice(0, i));
            if (i < total) {
              drawTimer = window.setTimeout(tick, 30);
            } else {
              new g.maps.Marker({
                position: points[0],
                map,
                icon: {
                  path: g.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#22c55e",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                },
                zIndex: 3,
              });
              new g.maps.Marker({
                position: points[points.length - 1],
                map,
                icon: {
                  path: g.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#ef4444",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                },
                zIndex: 3,
              });
              setReady(true);
            }
          };
          tick();
        } else {
          drawComplete(points);
          setReady(true);
        }
      } catch (e) {
        console.error("Map mode error:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (drawTimer) window.clearTimeout(drawTimer);
    };
  }, [points]);

  // Apply 3D toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (is3D) {
      map.setTilt(67.5);
      map.setHeading(35);
      const currentZoom = map.getZoom() ?? 14;
      map.setZoom(Math.min(20, currentZoom + 1));
    } else {
      map.setTilt(0);
      map.setHeading(0);
    }
  }, [is3D, ready]);

  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Rota não disponível
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* 2D / 3D toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => setIs3D(false)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            !is3D ? "bg-white text-black" : "text-white/80"
          }`}
          aria-pressed={!is3D}
        >
          <Square className="w-3 h-3" />
          2D
        </button>
        <button
          type="button"
          onClick={() => setIs3D(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            is3D ? "bg-white text-black" : "text-white/80"
          }`}
          aria-pressed={is3D}
        >
          <Box className="w-3 h-3" />
          3D
        </button>
      </div>
    </div>
  );
};
