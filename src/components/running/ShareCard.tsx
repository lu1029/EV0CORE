import { forwardRef } from "react";
import { buildPolyline, type LatLng } from "@/lib/routePolyline";

interface Props {
  activityLabel: string;
  distanceKm: number;
  durationFormatted: string;
  paceFormatted: string;
  caloriesKcal: number;
  date: string;
  photoUrl: string | null;
  points: LatLng[];
}

/**
 * Hidden 1080x1920 (9:16) card rendered offscreen and captured with html2canvas
 * for the "share to story" feature.
 */
export const ShareCard = forwardRef<HTMLDivElement, Props>(
  ({ activityLabel, distanceKm, durationFormatted, paceFormatted, caloriesKcal, date, photoUrl, points }, ref) => {
    const poly = points.length > 1 ? buildPolyline(points, { padding: 32, targetSize: 800 }) : null;

    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1920px",
          background: "linear-gradient(160deg, #1a1330 0%, #0b1220 50%, #0e2a1f 100%)",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Photo or animated route as background */}
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              crossOrigin="anonymous"
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.85) 100%)",
              }}
            />
          </>
        ) : (
          poly && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.85,
              }}
            >
              <svg viewBox={`0 0 ${poly.width} ${poly.height}`} style={{ width: "85%", height: "60%" }}>
                <path
                  d={poly.d}
                  stroke="#22c55e"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 16px #22c55e)" }}
                />
              </svg>
            </div>
          )
        )}

        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "rgba(99,102,241,0.35)",
            filter: "blur(120px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "rgba(34,197,94,0.3)",
            filter: "blur(140px)",
            borderRadius: "50%",
          }}
        />

        {/* Top branding */}
        <div style={{ position: "absolute", top: 60, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em" }}>EvoCore</div>
          <div style={{ fontSize: 24, opacity: 0.8 }}>{date}</div>
        </div>

        {/* Activity label */}
        <div style={{ position: "absolute", top: 180, left: 60, fontSize: 36, fontWeight: 600, opacity: 0.9 }}>
          {activityLabel}
        </div>

        {/* Big distance */}
        <div style={{ position: "absolute", top: 260, left: 60, right: 60 }}>
          <div style={{ fontSize: 280, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {distanceKm.toFixed(2)}
          </div>
          <div style={{ fontSize: 60, fontWeight: 500, opacity: 0.8, marginTop: -10 }}>quilômetros</div>
        </div>

        {/* Stats grid bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 60,
            right: 60,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 40,
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 32,
            padding: "44px 36px",
          }}
        >
          {[
            { label: "Tempo", value: durationFormatted },
            { label: "Pace", value: paceFormatted, unit: "/km" },
            { label: "Calorias", value: `${caloriesKcal}`, unit: "kcal" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, opacity: 0.6, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 64, fontWeight: 700 }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 28, fontWeight: 400, opacity: 0.7, marginLeft: 6 }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", fontSize: 22, opacity: 0.6 }}>
          ev0core.com
        </div>
      </div>
    );
  }
);
ShareCard.displayName = "ShareCard";
