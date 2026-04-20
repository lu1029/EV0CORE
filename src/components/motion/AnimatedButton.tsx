import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * AnimatedButton
 * - Scale + glow on hover/tap (CSS-only, GPU friendly)
 * - Ripple on click (pointer position)
 * - Magnetic hover on desktop (translate toward cursor; disabled on touch)
 *
 * Designed as a drop-in replacement for the shadcn `Button`. Reuses the same
 * variants so existing usages don't break.
 */

const animatedButtonVariants = cva(
  cn(
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-[transform,box-shadow,background-color,color] duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "overflow-hidden select-none",
    "active:scale-[0.97] hover:scale-[1.025]",
    "will-change-transform",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7),0_0_0_1px_hsl(var(--primary)/0.25)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive hover:shadow-[0_10px_30px_-12px_hsl(var(--destructive)/0.6)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-[0_8px_24px_-12px_hsl(var(--foreground)/0.25)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-[0_8px_22px_-14px_hsl(var(--foreground)/0.4)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: cn(
          "bg-primary text-primary-foreground font-semibold",
          "shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.55)]",
          "hover:shadow-[0_14px_44px_-10px_hsl(var(--primary)/0.85)]",
        ),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface Ripple { id: number; x: number; y: number; size: number; }

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  /** Disable magnetic-hover effect (still keeps scale/glow). Defaults to false. */
  noMagnetic?: boolean;
  /** Disable ripple effect. Defaults to false. */
  noRipple?: boolean;
}

const isFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      noMagnetic = false,
      noRipple = false,
      onClick,
      onPointerMove,
      onPointerLeave,
      children,
      ...props
    },
    forwardedRef,
  ) => {
    const Comp = asChild ? Slot : "button";
    const innerRef = React.useRef<HTMLButtonElement | null>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLButtonElement);

    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const idRef = React.useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!noRipple) {
        const el = innerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          const id = ++idRef.current;
          setRipples((prev) => [...prev, { id, x, y, size }]);
          window.setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
          }, 650);
        }
      }
      onClick?.(e);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!noMagnetic && isFinePointer()) {
        const el = innerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.18;
          const dy = (e.clientY - cy) * 0.22;
          el.style.setProperty("--mx", `${dx}px`);
          el.style.setProperty("--my", `${dy}px`);
        }
      }
      onPointerMove?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
      const el = innerRef.current;
      if (el) {
        el.style.setProperty("--mx", `0px`);
        el.style.setProperty("--my", `0px`);
      }
      onPointerLeave?.(e);
    };

    return (
      <Comp
        ref={innerRef}
        className={cn(animatedButtonVariants({ variant, size }), className)}
        style={{
          transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
        }}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children as React.ReactNode}</span>
        {/* Ripple layer */}
        {!noRipple && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            {ripples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-white/35 mix-blend-overlay"
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.size,
                  height: r.size,
                  animation: "ripple 600ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
                }}
              />
            ))}
          </span>
        )}
      </Comp>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };
