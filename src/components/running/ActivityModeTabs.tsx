import { motion } from "framer-motion";
import { Map, Sparkles, Camera } from "lucide-react";

export type ActivityMode = "map" | "animation" | "photo";

interface Props {
  mode: ActivityMode;
  onChange: (m: ActivityMode) => void;
  hasPhoto?: boolean;
}

const ITEMS: { id: ActivityMode; label: string; Icon: typeof Map }[] = [
  { id: "map", label: "Mapa", Icon: Map },
  { id: "animation", label: "Animação", Icon: Sparkles },
  { id: "photo", label: "Foto", Icon: Camera },
];

export const ActivityModeTabs = ({ mode, onChange, hasPhoto }: Props) => {
  return (
    <div className="px-4 pt-3">
      <div className="relative grid grid-cols-3 p-1 rounded-2xl glass-card">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
              aria-label={label}
            >
              {active && (
                <motion.div
                  layoutId="activity-mode-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/90 to-primary/70 shadow-lg shadow-primary/30"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={`w-4 h-4 relative z-10 transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative z-10 transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {id === "photo" && hasPhoto && !active && (
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
