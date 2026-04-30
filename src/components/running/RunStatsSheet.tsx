import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";
import { ChevronUp, Footprints } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  unit?: string;
}

interface Props {
  activityLabel: string;
  dateString: string;
  primaryStats: Stat[]; // shown collapsed (3 max)
  detailStats: Stat[]; // shown when expanded
  /** Collapsed sheet height in px (the strip visible above the bottom nav). */
  collapsedHeight?: number;
  /** Bottom offset to leave room for the bottom navigation bar. */
  bottomOffset?: number;
  children?: React.ReactNode; // extra content (e.g. elevation chart)
}

/**
 * EvoCore draggable bottom sheet that overlays the fullscreen map.
 * Drag up to expand, drag down (or tap chevron) to collapse.
 */
export const RunStatsSheet = ({
  activityLabel,
  dateString,
  primaryStats,
  detailStats,
  collapsedHeight = 230,
  bottomOffset = 0,
  children,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState<number>(0);
  const y = useMotionValue(0);

  // Measure expanded height (viewport based)
  useEffect(() => {
    const measure = () => {
      // expanded height = ~80% of viewport (capped)
      const h = Math.min(window.innerHeight * 0.82, 720);
      setExpandedHeight(h);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Animate sheet between collapsed and expanded heights via translateY trick:
  // We render the sheet at expandedHeight and translate it down by (expandedHeight - collapsedHeight) when collapsed.
  const collapsedY = expandedHeight - collapsedHeight;

  useEffect(() => {
    const target = expanded ? 0 : collapsedY;
    const controls = animate(y, target, { type: "spring", stiffness: 380, damping: 38 });
    return controls.stop;
  }, [expanded, collapsedY, y]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const current = y.get();
      const velocity = info.velocity.y;
      // Decide based on midpoint + velocity
      const midpoint = collapsedY / 2;
      const shouldExpand = velocity < -300 || (velocity < 300 && current < midpoint);
      setExpanded(shouldExpand);
    },
    [collapsedY, y]
  );

  return (
    <motion.div
      ref={containerRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: collapsedY }}
      dragElastic={0.06}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ y, height: expandedHeight, bottom: bottomOffset }}
      className="fixed left-0 right-0 z-30 bg-background/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)] touch-none"
    >
      {/* Drag handle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full pt-2.5 pb-1.5 flex flex-col items-center gap-1 active:opacity-80"
        aria-label={expanded ? "Recolher" : "Expandir"}
      >
        <div className="w-10 h-1 rounded-full bg-white/30" />
        <ChevronUp
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Header (always visible) */}
      <div className="px-5 pb-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
          <Footprints className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground font-heading font-bold text-sm truncate">{activityLabel}</p>
          <p className="text-muted-foreground text-xs truncate">{dateString}</p>
        </div>
      </div>

      {/* Primary stats (collapsed view) */}
      <div className="px-5 grid grid-cols-3 gap-3">
        {primaryStats.map((s) => (
          <div key={s.label}>
            <p className="text-muted-foreground text-[9px] uppercase tracking-wider mb-0.5">{s.label}</p>
            <p className="text-xl font-heading font-bold text-foreground leading-tight">
              {s.value}
              {s.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{s.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Expanded content */}
      <div className="px-5 pt-5 pb-8 overflow-y-auto" style={{ maxHeight: expandedHeight - collapsedHeight }}>
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          {detailStats.map((s) => (
            <div key={s.label}>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-0.5">{s.label}</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                {s.value}
                {s.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{s.unit}</span>}
              </p>
            </div>
          ))}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </motion.div>
  );
};
