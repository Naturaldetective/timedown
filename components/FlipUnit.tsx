"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

function splitDigits(value: string) {
  return value.split("");
}

export function FlipUnit({
  label,
  value,
  narrow,
}: {
  label: string;
  value: string;
  narrow?: boolean;
}) {
  const chars = splitDigits(value);
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div
        className={`flex gap-1.5 ${narrow ? "scale-95" : ""}`}
        style={{ perspective: 900 }}
      >
        {chars.map((ch, i) => (
          <FlipDigit key={`${i}-${chars.length}`} digit={ch} index={i} />
        ))}
      </div>
    </div>
  );
}

function FlipDigit({ digit, index }: { digit: string; index: number }) {
  const [display, setDisplay] = useState(digit);

  useEffect(() => {
    if (digit !== display) {
      const t = setTimeout(() => setDisplay(digit), 40);
      return () => clearTimeout(t);
    }
  }, [digit, display]);

  return (
    <div
      className="relative h-[4.5rem] w-[2.65rem] overflow-hidden rounded-lg sm:h-[5.25rem] sm:w-[3rem] md:h-[6rem] md:w-[3.35rem]"
      style={{ perspective: 800 }}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#363c4a] to-[#232830] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.07]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${index}-${display}`}
          initial={{ rotateX: -88, opacity: 0.25, y: 8 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 78, opacity: 0, y: -10 }}
          transition={{
            duration: 0.48,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 flex items-center justify-center font-mono text-[2.35rem] font-semibold tracking-tight text-white drop-shadow-sm sm:text-[2.75rem] md:text-[3.15rem]"
          style={{ transformOrigin: "center center", transformStyle: "preserve-3d" }}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
