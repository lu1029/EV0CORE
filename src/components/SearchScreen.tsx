import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Users, Dumbbell, Sparkles } from "lucide-react";
import { fadeUp, stagger, springSnappy } from "@/lib/motion";
import { AnimatedText } from "./motion/AnimatedText";

/**
 * Placeholder search screen — UI only. Will be wired to backend search later.
 */
const SearchScreen = () => {
  const [query, setQuery] = useState("");

  const suggestions = [
    { icon: Users,    label: "Atletas em alta" },
    { icon: Dumbbell, label: "Treinos populares" },
    { icon: Sparkles, label: "Novos planos da IA" },
  ];

  return (
    <motion.div
      className="pb-28 px-5 pt-8 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp}>
        <AnimatedText
          as="h1"
          text="Buscar"
          gradient
          className="text-[32px] font-bold tracking-[-0.03em] mb-6 block"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuários, treinos…"
          className="w-full h-12 rounded-full bg-card border border-border/60 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
        />
      </motion.div>

      <motion.section variants={fadeUp}>
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3 px-1">
          Sugestões
        </p>
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.label}
              whileHover={{ x: 4, transition: springSnappy }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left active:bg-secondary/50 transition-colors ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[15px] text-foreground">{s.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.div
        variants={fadeUp}
        className="mt-10 text-center text-[13px] text-muted-foreground"
      >
        Em breve: descobrir atletas, treinos da comunidade e desafios.
      </motion.div>
    </motion.div>
  );
};

export default SearchScreen;
