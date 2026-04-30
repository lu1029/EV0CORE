import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { loadFont as loadHeading } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const { fontFamily: HEADING } = loadHeading("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: BODY } = loadBody("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

const COLORS = {
  bg: "#0B1220",
  surface: "rgba(15, 23, 42, 0.85)",
  border: "rgba(255,255,255,0.10)",
  text: "#F8FAFC",
  muted: "#94A3B8",
  primary: "#818CF8",      // indigo-400
  primaryDeep: "#6366F1",  // indigo-500
  accent: "#22C55E",
  red: "#EF4444",
};

// ─────────────────────────────────────────────────────────────────
// Persistent animated mesh gradient background
// ─────────────────────────────────────────────────────────────────
const MeshBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const x1 = 30 + Math.sin(frame / 60) * 10;
  const y1 = 25 + Math.cos(frame / 70) * 8;
  const x2 = 75 + Math.cos(frame / 80) * 12;
  const y2 = 70 + Math.sin(frame / 65) * 10;
  return (
    <AbsoluteFill style={{
      background: `
        radial-gradient(circle at ${x1}% ${y1}%, rgba(99,102,241,0.35), transparent 55%),
        radial-gradient(circle at ${x2}% ${y2}%, rgba(34,197,94,0.18), transparent 50%),
        ${COLORS.bg}
      `,
    }} />
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 1 — INTRO (logo + tagline)
// ─────────────────────────────────────────────────────────────────
const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);
  const logoOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(spring({ frame: frame - 25, fps, config: { damping: 18 } }), [0, 1], [20, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
      <div style={{ opacity: logoOp, transform: `scale(${logoScale})`, filter: `drop-shadow(0 0 60px rgba(129,140,248,0.55))` }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 360, height: "auto" }} />
      </div>
      <div style={{ opacity: tagOp, transform: `translateY(${tagY}px)`, textAlign: "center" }}>
        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 76, color: COLORS.text, margin: 0, letterSpacing: -1.5 }}>
          Evolua
        </p>
        <p style={{ fontFamily: HEADING, fontWeight: 500, fontSize: 44, color: COLORS.primary, margin: 0, letterSpacing: -0.5 }}>
          seu corpo.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// Reusable framing for feature scenes
// ─────────────────────────────────────────────────────────────────
const FeatureScene: React.FC<{ badge: string; title: string; subtitle: string; children: React.ReactNode }> = ({ badge, title, subtitle, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-20, 0]);
  return (
    <AbsoluteFill>
      {children}
      <div style={{ position: "absolute", top: 100, left: 60, right: 60, opacity: headOp, transform: `translateY(${headY}px)` }}>
        <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: "rgba(129,140,248,0.18)", border: `1px solid ${COLORS.primary}55`, color: COLORS.primary, fontFamily: BODY, fontWeight: 700, fontSize: 22, letterSpacing: 2 }}>
          {badge}
        </div>
        <h2 style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 80, color: COLORS.text, margin: "20px 0 10px", letterSpacing: -2, lineHeight: 1.05 }}>
          {title}
        </h2>
        <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: 32, color: COLORS.muted, margin: 0, lineHeight: 1.3 }}>
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 2 — HOME / Streak ring
// ─────────────────────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ringP = spring({ frame: frame - 6, fps, config: { damping: 30, stiffness: 80, mass: 1.2 } });
  const ringPct = interpolate(ringP, [0, 1], [0, 0.78]);
  const r = 200, c = 2 * Math.PI * r;
  const dash = c * ringPct;
  const counterRaw = interpolate(frame, [10, 70], [0, 14], { extrapolateRight: "clamp" });
  const counter = Math.round(counterRaw);
  const cardOp = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(spring({ frame: frame - 25, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56 }}>
      {/* Progress ring */}
      <div style={{ position: "relative", width: 460, height: 460 }}>
        <svg width="460" height="460" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="230" cy="230" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="22" fill="none" />
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={COLORS.primaryDeep} />
              <stop offset="100%" stopColor={COLORS.primary} />
            </linearGradient>
          </defs>
          <circle cx="230" cy="230" r={r} stroke="url(#g1)" strokeWidth="22" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 130, color: COLORS.text, margin: 0, letterSpacing: -3, lineHeight: 1 }}>{counter}</p>
          <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: COLORS.muted, marginTop: 6 }}>treinos / mês</p>
        </div>
      </div>
      {/* Streak chip */}
      <div style={{ opacity: cardOp, transform: `translateY(${cardY}px)`, padding: "20px 40px", borderRadius: 28, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ fontSize: 56 }}>🔥</span>
        <div>
          <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 48, color: COLORS.text, margin: 0, lineHeight: 1 }}>21 dias</p>
          <p style={{ fontFamily: BODY, fontSize: 22, color: COLORS.muted, margin: "4px 0 0" }}>de constância</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 3 — TREINOS (workout cards)
// ─────────────────────────────────────────────────────────────────
const WorkoutScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exercises = [
    { name: "Supino reto", sets: "4 × 10", icon: "💪" },
    { name: "Desenvolvimento", sets: "4 × 12", icon: "🏋️" },
    { name: "Tríceps corda", sets: "3 × 15", icon: "🔥" },
    { name: "Elevação lateral", sets: "3 × 12", icon: "⚡" },
  ];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 540, display: "flex", flexDirection: "column", gap: 22 }}>
      {exercises.map((ex, i) => {
        const s = spring({ frame: frame - i * 8, fps, config: { damping: 18, stiffness: 110 } });
        const op = interpolate(s, [0, 1], [0, 1]);
        const x = interpolate(s, [0, 1], [80, 0]);
        return (
          <div key={ex.name} style={{
            opacity: op, transform: `translateX(${x}px)`,
            background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 28,
            padding: "26px 30px", display: "flex", alignItems: "center", gap: 22,
            backdropFilter: "blur(24px)",
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>
              {ex.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 34, color: COLORS.text, margin: 0 }}>{ex.name}</p>
              <p style={{ fontFamily: BODY, fontWeight: 500, fontSize: 24, color: COLORS.muted, margin: "4px 0 0" }}>{ex.sets}</p>
            </div>
            <div style={{ width: 18, height: 18, borderRadius: 9, border: `3px solid ${COLORS.primary}` }} />
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 4 — CORRIDA (real map background + animated route)
// ─────────────────────────────────────────────────────────────────
const RunScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Route hand-tuned to feel organic across the map image
  const routePts: Array<[number, number]> = [
    [120, 880], [180, 800], [260, 760], [330, 700], [380, 620],
    [420, 540], [400, 460], [340, 400], [270, 380], [210, 410],
    [180, 480], [220, 560], [310, 600], [400, 590], [480, 540],
    [540, 470], [560, 380], [520, 300], [440, 260], [360, 280],
    [310, 350],
  ];
  const path = routePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  // Compute approx total length for stroke-dash animation
  let total = 0;
  for (let i = 1; i < routePts.length; i++) {
    const [x1, y1] = routePts[i - 1]; const [x2, y2] = routePts[i];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  const draw = interpolate(frame, [10, 70], [0, 1], { extrapolateRight: "clamp" });
  const dashOffset = total * (1 - draw);

  // Counters
  const distance = (interpolate(frame, [10, 80], [0, 5.42], { extrapolateRight: "clamp" })).toFixed(2);
  const seconds = Math.floor(interpolate(frame, [10, 80], [0, 28 * 60 + 14], { extrapolateRight: "clamp" }));
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  // Floating stat card
  const cardOp = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(spring({ frame: frame - 55, fps, config: { damping: 18 } }), [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* REAL stylized map background */}
      <Img src={staticFile("images/run-map.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Subtle dim overlay so UI on top reads */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.10) 35%, rgba(11,18,32,0.10) 65%, rgba(11,18,32,0.85) 100%)" }} />

      {/* Animated route polyline (centered scaled SVG over the map) */}
      <svg viewBox="0 0 700 1100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        {/* outer glow */}
        <path d={path} stroke="#6366F1" strokeOpacity={0.45} strokeWidth={28} fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={total} strokeDashoffset={dashOffset} />
        {/* main */}
        <path d={path} stroke="#A5B4FC" strokeOpacity={1} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={total} strokeDashoffset={dashOffset} />
        {/* start marker */}
        <circle cx={routePts[0][0]} cy={routePts[0][1]} r={18} fill={COLORS.accent} stroke="#fff" strokeWidth={6} />
        {/* moving runner dot */}
        {(() => {
          // approximate position along the path
          const tIdx = (routePts.length - 1) * draw;
          const i = Math.min(routePts.length - 2, Math.floor(tIdx));
          const f = tIdx - i;
          const [x1, y1] = routePts[i]; const [x2, y2] = routePts[i + 1];
          const x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f;
          return <circle cx={x} cy={y} r={22} fill={COLORS.primary} stroke="#fff" strokeWidth={6} />;
        })()}
      </svg>

      {/* Stats card overlay (Strava-free, EvoCore brand) */}
      <div style={{ position: "absolute", bottom: 90, left: 60, right: 60, opacity: cardOp, transform: `translateY(${cardY}px)` }}>
        <div style={{ background: "rgba(11,18,32,0.78)", border: `1px solid ${COLORS.border}`, borderRadius: 36, padding: "30px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 110, color: COLORS.text, margin: 0, letterSpacing: -3, lineHeight: 1 }}>{distance}</p>
            <p style={{ fontFamily: BODY, fontSize: 22, color: COLORS.muted, margin: "8px 0 0", letterSpacing: 3, textTransform: "uppercase" }}>quilômetros</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              { label: "TEMPO", val: `${mm}:${ss}` },
              { label: "PACE /KM", val: "5:12" },
              { label: "KCAL", val: "412" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 42, color: COLORS.text, margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: 16, color: COLORS.muted, margin: "8px 0 0", letterSpacing: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 5 — NUTRIÇÃO (macros)
// ─────────────────────────────────────────────────────────────────
const NutritionScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const macros = [
    { label: "CARBO", target: 280, cur: 215, color: "#FCD34D" },
    { label: "PROTEÍNA", target: 160, cur: 142, color: COLORS.primary },
    { label: "GORDURA", target: 70, cur: 48, color: "#34D399" },
  ];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 560, display: "flex", flexDirection: "column", gap: 30 }}>
      {/* Big calories card */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 32, padding: "28px 30px", textAlign: "center" }}>
        <p style={{ fontFamily: BODY, color: COLORS.muted, fontSize: 22, letterSpacing: 2, margin: 0 }}>HOJE</p>
        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 100, color: COLORS.text, margin: "4px 0 0", letterSpacing: -3, lineHeight: 1 }}>
          1.847 <span style={{ fontSize: 42, color: COLORS.muted, fontWeight: 500 }}>kcal</span>
        </p>
      </div>
      {macros.map((m, i) => {
        const s = spring({ frame: frame - 8 - i * 6, fps, config: { damping: 22 } });
        const pct = (m.cur / m.target) * s;
        return (
          <div key={m.label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: "22px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 30, color: COLORS.text, margin: 0, letterSpacing: 1 }}>{m.label}</p>
              <p style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: COLORS.muted, margin: 0 }}>
                {Math.round(m.cur * s)}<span style={{ fontSize: 18, opacity: 0.6 }}> / {m.target}g</span>
              </p>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, pct * 100)}%`, background: m.color, borderRadius: 7 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scene 6 — OUTRO
// ─────────────────────────────────────────────────────────────────
const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const sc = interpolate(sp, [0, 1], [0.7, 1]);
  const op = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const taglineOp = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: "clamp" });
  const urlOp = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 48 }}>
      <div style={{ opacity: op, transform: `scale(${sc})`, filter: "drop-shadow(0 0 70px rgba(129,140,248,0.6))" }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 380, height: "auto" }} />
      </div>
      <div style={{ opacity: taglineOp, textAlign: "center", padding: "0 60px" }}>
        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 56, color: COLORS.text, margin: 0, letterSpacing: -1.2, lineHeight: 1.1 }}>
          Treino. Corrida.
        </p>
        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 56, color: COLORS.primary, margin: 0, letterSpacing: -1.2, lineHeight: 1.1 }}>
          Nutrição.
        </p>
      </div>
      <div style={{ opacity: urlOp, padding: "16px 36px", borderRadius: 999, background: "linear-gradient(135deg, #6366F1, #818CF8)" }}>
        <p style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 38, color: "#fff", margin: 0, letterSpacing: 1 }}>ev0core.com</p>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// Composition
// ─────────────────────────────────────────────────────────────────
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: BODY }}>
      <MeshBackground />
      <Sequence from={0} durationInFrames={70}><Scene1Intro /></Sequence>
      <Sequence from={70} durationInFrames={90}>
        <FeatureScene badge="HOME" title="Sua jornada, em foco." subtitle="Acompanhe streak, treinos e progresso real.">
          <HomeScreen />
        </FeatureScene>
      </Sequence>
      <Sequence from={160} durationInFrames={90}>
        <FeatureScene badge="TREINOS" title="Planos sob medida." subtitle="Personal trainer EvoAI dentro do app.">
          <WorkoutScreen />
        </FeatureScene>
      </Sequence>
      <Sequence from={250} durationInFrames={100}>
        <FeatureScene badge="CORRIDA" title="GPS imersivo." subtitle="Mapa em tela cheia. Pace. Calorias. Tudo seu.">
          <RunScreen />
        </FeatureScene>
      </Sequence>
      <Sequence from={350} durationInFrames={90}>
        <FeatureScene badge="NUTRIÇÃO" title="Macros do seu jeito." subtitle="Conte calorias sem complicação.">
          <NutritionScreen />
        </FeatureScene>
      </Sequence>
      <Sequence from={440} durationInFrames={70}><Scene6Outro /></Sequence>
    </AbsoluteFill>
  );
};
