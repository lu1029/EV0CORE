import { useMemo } from "react";
import { motion } from "framer-motion";
import { buildPolyline, type LatLng } from "@/lib/routePolyline";

interface Props {
  points: LatLng[];
}

export const ActivityAnimationMode = ({ points }: Props) => {
  const poly = useMemo(() => buildPolyline(points, { padding: 32, targetSize: 600 }), [points]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(263,70%,15%)] via-[hsl(220,70%,12%)] to-[hsl(142,40%,12%)]" />
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/30 blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-pulse"
        style={{ animationDelay: "1.2s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[hsl(263,70%,50%)]/20 blur-3xl" />

      {/* SVG polyline */}
      {poly ? (
        <div className="relative w-full h-full flex items-center justify-center p-6">
          <svg
            viewBox={`0 0 ${poly.width} ${poly.height}`}
            className="max-w-full max-h-full"
            style={{ filter: "drop-shadow(0 0 12px hsl(142, 71%, 50%))" }}
          >
            <defs>
              <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(142, 71%, 55%)" />
                <stop offset="50%" stopColor="hsl(180, 70%, 55%)" />
                <stop offset="100%" stopColor="hsl(263, 70%, 60%)" />
              </linearGradient>
            </defs>
            {/* Faint base path */}
            <path
              d={poly.d}
              stroke="hsl(142, 71%, 45% / 0.15)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated draw */}
            <motion.path
              d={poly.d}
              stroke="url(#route-gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.5, ease: [0.32, 0.72, 0, 1] }}
            />
          </svg>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          Rota não disponível
        </div>
      )}
    </div>
  );
};
