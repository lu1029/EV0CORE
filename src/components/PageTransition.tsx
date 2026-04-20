import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { pageTransition } from "@/lib/motion";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
