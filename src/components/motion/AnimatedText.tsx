import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeApple } from "@/lib/motion";

interface AnimatedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Stagger gap in seconds between each word. */
  stagger?: number;
  /** Delay before the first word, in seconds. */
  delay?: number;
  /** Apply the flowing gradient color treatment. */
  gradient?: boolean;
  /** Duration per word, in seconds. */
  duration?: number;
}

const container: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const word: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: d, ease: easeApple },
  }),
};

/**
 * AnimatedText — reveals each word with a soft slide-up + de-blur.
 * Accepts a tag (`as`) so it works for h1/h2/h3 and inline spans.
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as = "span",
  className,
  stagger = 0.06,
  delay = 0,
  gradient = false,
  duration = 0.55,
}) => {
  const words = useMemo(() => text.split(" "), [text]);
  const MotionTag = motion[as] as typeof motion.span;

  return (
    <MotionTag
      className={cn(gradient && "text-gradient-flow", className)}
      variants={container}
      initial="hidden"
      animate="visible"
      custom={{ stagger, delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          custom={duration}
          variants={word}
          className="inline-block will-change-transform"
          style={{ marginRight: "0.28em" }}
        >
          {w}
        </motion.span>
      ))}
    </MotionTag>
  );
};

export default AnimatedText;
