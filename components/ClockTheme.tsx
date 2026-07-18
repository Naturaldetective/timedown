"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { pad2 } from "@/lib/time";
import type { TimeParts } from "@/lib/time";

function CornerBlock({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex min-w-[3.25rem] flex-col rounded-lg bg-black/35 px-2.5 py-2 ring-1 ring-white/10 backdrop-blur-md">
      <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-lg font-semibold tabular-nums text-zinc-100">
        {value}
      </span>
    </div>
  );
}

export function ClockTheme({
  title,
  parts,
  tickKey,
}: {
  title: string;
  parts: TimeParts;
  /** 每秒变化，用于驱动大屏动效 */
  tickKey: number;
}) {
  const h = pad2(parts.hours);
  const m = pad2(parts.minutes);
  const s = pad2(parts.seconds);

  const secondSpring = useSpring(parts.seconds, {
    stiffness: 420,
    damping: 24,
    mass: 0.7,
  });

  const pulse = useTransform(secondSpring, (v) => 1 + Math.sin(v * Math.PI) * 0.06);

  useEffect(() => {
    secondSpring.set(parts.seconds);
  }, [parts.seconds, secondSpring]);

  const rings = useMemo(() => {
    const secAngle = (parts.seconds / 60) * 360;
    const minAngle = (parts.minutes / 60) * 360;
    const hrAngle = ((parts.hours % 12) / 12) * 360;
    return { secAngle, minAngle, hrAngle };
  }, [parts.hours, parts.minutes, parts.seconds]);

  const flashRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#07080c]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(56,189,248,0.14), transparent 55%), radial-gradient(circle at 10% 90%, rgba(99,102,241,0.12), transparent 40%)",
        }}
      />
      <motion.div
        key={tickKey}
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-cyan-400/10 mix-blend-screen"
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      />

      {/* 角落紧凑信息 */}
      <div className="fixed right-4 top-4 z-20 flex flex-wrap justify-end gap-2 sm:right-6 sm:top-6">
        <CornerBlock label="天" value={parts.days} />
        <CornerBlock label="时" value={h} />
        <CornerBlock label="分" value={m} />
        <CornerBlock label="秒" value={s} />
      </div>

      {/* 任务名：顶部独立条，更醒目 */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex flex-col items-center px-4 pb-2 pt-10 text-center sm:pt-14">
        <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-cyan-300/95 sm:text-[11px]">
          当前任务
        </span>
        <h2 className="mt-2 max-w-[min(92vw,720px)] text-balance text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-3xl md:text-[2.5rem]">
          {title}
        </h2>
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-24 pt-36 sm:pt-40">
        <motion.div
          key={tickKey}
          className="relative flex items-center justify-center"
          initial={{ x: 0, rotate: 0 }}
          animate={{
            x: [0, -10, 9, -7, 6, 0],
            rotate: [0, -1.2, 1.1, -0.8, 0.6, 0],
          }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <motion.div
            className="absolute h-[min(92vw,560px)] w-[min(92vw,560px)] rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/10 to-fuchsia-500/20 blur-3xl"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 8, -6, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            style={{ scale: pulse }}
            className="relative flex h-[min(80vw,500px)] w-[min(80vw,500px)] items-center justify-center sm:h-[min(78vw,520px)] sm:w-[min(78vw,520px)]"
          >
            <svg
              className="absolute inset-0 -rotate-90 text-white/5"
              viewBox="0 0 200 200"
              aria-hidden
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="url(#g1)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 92}
                initial={false}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 92 * (1 - rings.secAngle / 360),
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              />
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="url(#g2)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 68}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 68 * (1 - rings.minAngle / 360),
                }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              />
              <circle
                cx="100"
                cy="100"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="44"
                fill="none"
                stroke="url(#g3)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 44 * (1 - rings.hrAngle / 360),
                }}
                transition={{ type: "spring", stiffness: 160, damping: 26 }}
              />
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="g3" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              key={tickKey}
              className="relative z-[1] text-center font-mono"
              initial={{
                scale: 0.92,
                rotateX: -12,
                filter: "blur(6px)",
                y: 18,
              }}
              animate={{
                scale: 1,
                rotateX: 0,
                filter: "blur(0px)",
                y: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                mass: 0.55,
              }}
            >
              <div className="text-[clamp(2.5rem,12vw,5.5rem)] font-bold leading-none tracking-tight text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                {h}:{m}
              </div>
              <motion.div
                className="mt-3 text-[clamp(3.5rem,18vw,8rem)] font-bold leading-none tabular-nums text-cyan-200"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(34,211,238,0.5)",
                    "0 0 48px rgba(99,102,241,0.75)",
                    "0 0 20px rgba(34,211,238,0.5)",
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {s}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
