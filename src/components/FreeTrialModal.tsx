import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";

const TRIAL_STORAGE_KEY = "evocore_trial_prompt_shown";

const FreeTrialModal = () => {
  const { isPremium, setCurrentTab } = useApp();
  const { isActive } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user is already premium or if prompt was already shown in this session
    const hasShown = sessionStorage.getItem(TRIAL_STORAGE_KEY);
    
    // We only show it to non-premium users who haven't seen it in this session
    if (!isPremium && !isActive && !hasShown) {
      // Delay it slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(TRIAL_STORAGE_KEY, "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, isActive]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-card border border-border/50 shadow-2xl"
        >
          {/* Close button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Image / Background decoration */}
          <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
             </div>
             
             <motion.div
               animate={{ 
                 y: [0, -10, 0],
                 rotate: [0, 5, 0]
               }}
               transition={{ 
                 duration: 4, 
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
               className="relative z-0 w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner"
             >
                <Sparkles className="w-12 h-12 text-primary" strokeWidth={2.5} />
             </motion.div>
          </div>

          <div className="p-8 pt-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-bold uppercase tracking-wider mb-4">
              Oferta Especial
            </span>
            
            <h2 className="text-[28px] font-bold text-foreground tracking-tight leading-tight mb-3">
              Teste Grátis por 7 Dias
            </h2>
            
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
              Experimente todos os recursos Pro do EvoCore sem pagar nada hoje. Cancele quando quiser.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: Clock, text: "7 dias de acesso total grátis" },
                { icon: ShieldCheck, text: "Sem cobrança agora" },
                { icon: Sparkles, text: "Cancele a qualquer momento" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-left px-4 py-2 rounded-xl bg-secondary/30">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[13px] font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setIsOpen(false);
                setCurrentTab("premium");
              }}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[16px] font-bold shadow-lg shadow-primary/25 group"
            >
              Começar meu Teste Grátis
              <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <p className="text-[11px] text-muted-foreground mt-4">
              Após 7 dias, a assinatura será cobrada automaticamente conforme o plano escolhido.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FreeTrialModal;
