import type { Variants, Transition } from "framer-motion";

// Apple-spring easing — used across the app for cinematic feel
export const easeApple: Transition["ease"] = [0.32, 0.72, 0, 1];
export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 28, mass: 0.9 };
export const springSnappy: Transition = { type: "spring", stiffness: 380, damping: 32 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeApple } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: easeApple } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeApple } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: easeApple } },
};

export const cardHover = {
  whileHover: { y: -4, transition: springSnappy },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};
