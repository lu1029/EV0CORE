import { useMemo } from "react";

interface Point {
  lat: number;
  lng: number;
  altitude?: number | null;
}

interface Props {
  points: Point[];
  /** 0..1 — current animation progress */
  progress: number;
  className?: string;
}

const W = 300;
const H = 56;
const PAD_X = 2;
const PAD_TOP = 4;
const PAD_BOTTOM = 2;

/**
 * Mini elevation chart that highlights the section already traversed.
 * Renders nothing if altitude data is missing.
 */
export const ElevationChart = ({ points, progress, className = "" }: Props) => {
  const data = useMemo(() => {
    const alts = points.map((p) => (typeof p.altitude === "number" ? p.altitude : null));
    if (!alts.some((a) => a !== null)) return null;

    // Forward/backward fill nulls with nearest known altitude
    const filled: number[] = new Array(alts.length).fill(0);
    let last = 0;
    for (let i = 0; i < alts.length; i++) {
      if (alts[i] !== null) last = alts[i] as number;
      filled[i] = last;
    }
    let next = filled[filled.length - 1];
    for (let i = alts.length - 1; i >= 0; i--) {
      if (alts[i] !== null) next = alts[i] as number;
      else filled[i] = next;
    }

    const min = Math.min(...filled);
    const max = Math.max(...filled);
    const range = Math.max(max - min, 1);

    const innerW = W - PAD_X * 2;
    const innerH = H - PAD_TOP - PAD_BOTTOM;
    const n = filled.length;

    const xy = filled.map((alt, i) => {
      const x = PAD_X + (i / Math.max(n - 1, 1)) * innerW;
      const y = PAD_TOP + (1 - (alt - min) / range) * innerH;
      return { x, y };
    });

    const linePath = xy.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    const areaPath = `${linePath} L ${xy[xy.length - 1].x.toFixed(2)} ${H - PAD_BOTTOM} L ${xy[0].x.toFixed(2)} ${H - PAD_BOTTOM} Z`;

    return { xy, linePath, areaPath, min, max };
  }, [points]);

  if (!data) return null;

  const { xy, linePath, areaPath, min, max } = data;
  const clamped = Math.max(0, Math.min(1, progress));
  const cutIndex = Math.max(0, Math.min(xy.length - 1, Math.floor(clamped * (xy.length - 1))));
  const head = xy[cutIndex];

  // Build "traversed" sub-path up to cutIndex (+ partial segment for smoothness)
  const traversedPath = xy
    .slice(0, cutIndex + 1)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full block"
        aria-label="Gráfico de elevação"
      >
        <defs>
          <linearGradient id="elev-area-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="elev-area-active" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
          </linearGradient>
          <clipPath id="elev-clip-active">
            <rect x="0" y="0" width={(W * clamped).toFixed(2)} height={H} />
          </clipPath>
        </defs>

        {/* Base area (untraversed) */}
        <path d={areaPath} fill="url(#elev-area-base)" />
        <path d={linePath} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {/* Active section (traversed) — clipped to current progress */}
        <g clipPath="url(#elev-clip-active)">
          <path d={areaPath} fill="url(#elev-area-active)" />
          <path d={traversedPath} stroke="#ff6a00" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </g>

        {/* Vertical progress indicator */}
        {head && (
          <>
            <line x1={head.x} y1={PAD_TOP} x2={head.x} y2={H - PAD_BOTTOM} stroke="#ff6a00" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx={head.x} cy={head.y} r="3.5" fill="#ff6a00" stroke="#ffffff" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Min/max labels */}
      <div className="flex justify-between text-[8px] text-white/50 leading-none mt-0.5 px-0.5">
        <span>{Math.round(min)}m</span>
        <span>{Math.round(max)}m</span>
      </div>
    </div>
  );
};
