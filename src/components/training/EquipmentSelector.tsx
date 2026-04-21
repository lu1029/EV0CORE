import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EQUIPMENT_OPTIONS, type EquipmentKey } from "./equipmentTypes";
import { fadeUp } from "@/lib/motion";

interface Props {
  selected: EquipmentKey[];
  onChange: (next: EquipmentKey[]) => void;
}

const EquipmentSelector = ({ selected, onChange }: Props) => {
  const toggle = (key: EquipmentKey) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };

  const allOn = selected.length === EQUIPMENT_OPTIONS.length;
  const toggleAll = () => onChange(allOn ? [] : EQUIPMENT_OPTIONS.map(o => o.key));

  return (
    <motion.div variants={fadeUp} className="px-5 pt-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">O que tenho em casa</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Filtra os planos e personaliza a IA</p>
        </div>
        <button
          onClick={toggleAll}
          className="text-[13px] font-medium text-primary active:opacity-60"
        >
          {allOn ? "Limpar" : "Todos"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_OPTIONS.map((opt) => {
          const active = selected.includes(opt.key);
          return (
            <motion.button
              key={opt.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(opt.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-colors text-[14px] font-medium ${
                active
                  ? "bg-primary/15 border-primary/40 text-foreground"
                  : "bg-card border-white/[0.06] text-muted-foreground"
              }`}
            >
              <span className="text-[16px] leading-none">{opt.emoji}</span>
              <span>{opt.label}</span>
              {active && <Check className="w-3.5 h-3.5 text-primary" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EquipmentSelector;
