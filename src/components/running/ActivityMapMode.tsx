import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LatLng } from "@/lib/routePolyline";

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
}

export const ActivityMapMode = ({ points }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || points.length < 2) return;
    let cancelled = false;
    let mapInstance: any = null;
    let drawTimer: number | null = null;

    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-maps-key");
        if (!data?.key || cancelled) return;
        await loadGoogleMaps(data.key);
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        if (!g?.maps) return;

        mapInstance = new g.maps.Map(containerRef.current, {
          disableDefaultUI: true,
          styles: darkMapStyles,
          gestureHandling: "greedy",
          zoomControl: false,
        });

        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        mapInstance.fitBounds(bounds, 50);

        // Animated polyline draw
        const polyline = new g.maps.Polyline({
          path: [],
          map: mapInstance,
          strokeColor: "hsl(142, 71%, 45%)",
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });

        if (!animatedRef.current) {
          animatedRef.current = true;
          let i = 0;
          const total = points.length;
          const stepSize = Math.max(1, Math.floor(total / 60)); // ~60 frames
          const tick = () => {
            if (cancelled) return;
            i = Math.min(i + stepSize, total);
            polyline.setPath(points.slice(0, i));
            if (i < total) {
              drawTimer = window.setTimeout(tick, 30);
            } else {
              // Add markers at the end
              new g.maps.Marker({
                position: points[0],
                map: mapInstance,
                icon: {
                  path: g.maps.SymbolPath.CIRCLE,
                  scale: 9,
                  fillColor: "#22c55e",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                },
              });
              new g.maps.Marker({
                position: points[points.length - 1],
                map: mapInstance,
                icon: {
                  path: g.maps.SymbolPath.CIRCLE,
                  scale: 9,
                  fillColor: "#ef4444",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                },
              });
            }
          };
          tick();
        } else {
          polyline.setPath(points);
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

  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Rota não disponível
      </div>
    );
  }
  return <div ref={containerRef} className="w-full h-full" />;
};
