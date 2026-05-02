import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import evoaiBot from "@/assets/evoai-bot.png";

/**
 * EvoAI Floating Action Button — fixed bottom-right above the tab bar.
 * Persistent virtual assistant accessible from any screen.
 */
const EvoAIFab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide when already on the AI screen
  if (location.pathname.startsWith("/ai")) return null;

  return (
    <button
      onClick={() => {
        try { (navigator as any).vibrate?.(10); } catch {}
        navigate("/ai");
      }}
      aria-label="EvoAI assistente"
      className="fixed z-50 right-4 bottom-[88px] safe-area-bottom"
    >
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_24px_-4px_hsl(142_71%_45%/0.5)] active:scale-90 transition-transform">
        <span className="absolute inset-0 rounded-full bg-[hsl(142_71%_45%/0.3)] animate-ping opacity-40" />
        <img src={evoaiBot} alt="EvoAI" className="relative w-14 h-14 object-contain" />
      </span>
    </button>
  );
};

export default EvoAIFab;
