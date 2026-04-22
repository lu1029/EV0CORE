import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useCheckins } from "@/hooks/useCheckin";

const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Premium consistency calendar — fills days with marks based on real checkins. */
export default function ConsistencyCalendar() {
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const { checkins, streak } = useCheckins(cursor);

  const map = useMemo(() => new Map(checkins.map(c => [c.checkin_date, c])), [checkins]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const totalDays = firstDay + daysInMonth;
  const cells = Array.from({ length: Math.ceil(totalDays / 7) * 7 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (i < firstDay || dayNum > daysInMonth) return null;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return { date, day: dayNum };
  });

  const completedDays = checkins.filter(c => c.worked_out || c.ran || c.logged_meal || c.hit_calorie_goal || c.manual_checkin).length;
  const consistencyPct = Math.round((completedDays / daysInMonth) * 100);

  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Consistência</p>
          <h3 className="font-heading font-bold text-lg capitalize">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:opacity-70"
          ><ChevronLeft className="w-4 h-4" /></button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:opacity-70"
          ><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Streak chip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-bold">
          <Flame className="w-4 h-4" />
          {streak} dias
        </div>
        <div className="flex-1 text-right">
          <p className="text-2xl font-heading font-bold leading-none">{consistencyPct}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">do mês</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">{l}</div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="aspect-square" />;
          const checkin = map.get(c.date);
          const completed = checkin && (checkin.worked_out || checkin.ran || checkin.logged_meal || checkin.hit_calorie_goal || checkin.manual_checkin);
          const isToday = c.date === today;
          const intensity = checkin
            ? [checkin.worked_out, checkin.ran, checkin.logged_meal, checkin.hit_calorie_goal].filter(Boolean).length
            : 0;
          return (
            <div
              key={i}
              className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold relative transition ${
                completed
                  ? intensity >= 3
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                    : intensity >= 2
                      ? "bg-primary/70 text-primary-foreground"
                      : "bg-primary/30 text-foreground border border-primary/40"
                  : "bg-secondary/40 text-muted-foreground"
              } ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
            >
              {c.day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-secondary" />Vazio</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/30" />Início</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/70" />Bom</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gradient-to-br from-primary to-accent" />Top</span>
      </div>
    </div>
  );
}
