import React, { useRef, useEffect, useCallback, useState } from "react";

interface ScrollPickerProps {
  values: number[];
  selectedValue: number;
  onChange: (value: number) => void;
  suffix?: string;
  itemHeight?: number;
}

const ScrollPicker = ({ values, selectedValue, onChange, suffix = "", itemHeight = 48 }: ScrollPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const visibleItems = 5;
  const containerHeight = itemHeight * visibleItems;
  const paddingItems = Math.floor(visibleItems / 2);

  const scrollToValue = useCallback((value: number, smooth = true) => {
    const index = values.indexOf(value);
    if (index === -1 || !containerRef.current) return;
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: smooth ? "smooth" : "instant",
    });
  }, [values, itemHeight]);

  useEffect(() => {
    scrollToValue(selectedValue, false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    setIsScrolling(true);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      
      containerRef.current.scrollTo({
        top: clampedIndex * itemHeight,
        behavior: "smooth",
      });

      if (values[clampedIndex] !== selectedValue) {
        onChange(values[clampedIndex]);
      }
      setIsScrolling(false);
    }, 80);
  }, [values, itemHeight, selectedValue, onChange]);

  return (
    <div className="relative flex flex-col items-center" style={{ height: containerHeight }}>
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 border-y border-primary/40 bg-primary/5 rounded-lg z-0 pointer-events-none"
        style={{
          top: paddingItems * itemHeight,
          height: itemHeight,
        }}
      />

      {/* Gradient masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
        style={{
          height: containerHeight,
          scrollSnapType: "y mandatory",
        }}
      >
        {/* Top padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`top-${i}`} style={{ height: itemHeight }} />
        ))}

        {values.map((value, i) => {
          return (
            <div
              key={value}
              className="flex items-center justify-center snap-center cursor-pointer transition-all duration-200"
              style={{ height: itemHeight }}
              onClick={() => {
                onChange(value);
                scrollToValue(value);
              }}
            >
              <span
                className={`text-2xl font-heading font-bold transition-all duration-200 ${
                  value === selectedValue
                    ? "text-foreground scale-110"
                    : "text-muted-foreground/40 scale-90"
                }`}
              >
                {value}{suffix}
              </span>
            </div>
          );
        })}

        {/* Bottom padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`bottom-${i}`} style={{ height: itemHeight }} />
        ))}
      </div>
    </div>
  );
};

export default ScrollPicker;
