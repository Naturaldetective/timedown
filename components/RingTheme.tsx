"use client";

import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useReducer } from "react";
import type { TimeParts } from "@/lib/time";

const VB = 1000;
const CX = VB / 2;
const CY = VB / 2;

function alignRotation(activeIndex: number, count: number) {
  return 90 - (360 * activeIndex) / count;
}

function formatTargetEn(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RingLayerSVG({
  count,
  radius,
  fontSize,
  activeIndex,
  gradientId,
  dimColor,
}: {
  count: number;
  radius: number;
  fontSize: number;
  activeIndex: number;
  gradientId: string;
  dimColor: string;
}) {
  const safe = ((activeIndex % count) + count) % count;
  const target = alignRotation(safe, count);
  const rot = useMotionValue(target);
  const [, bump] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    const c = animate(rot, target, {
      type: "spring",
      stiffness: 128,
      damping: 19,
      mass: 0.78,
    });
    return () => c.stop();
  }, [target, rot]);

  useMotionValueEvent(rot, "change", bump);

  const R = rot.get();

  return (
    <g className="tabular-nums" style={{ shapeRendering: "geometricPrecision" }}>
      {Array.from({ length: count }, (_, i) => {
        const thetaDeg = -90 + (360 * i) / count + R;
        const rad = (thetaDeg * Math.PI) / 180;
        const x = CX + radius * Math.cos(rad);
        const y = CY + radius * Math.sin(rad);
        const active = i === safe;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill={active ? `url(#${gradientId})` : dimColor}
            stroke={active ? "rgba(15,23,42,0.92)" : "rgba(2,6,23,0.88)"}
            strokeWidth={active ? 0.55 : 0.38}
            paintOrder="stroke fill"
            opacity={active ? 1 : 0.62}
            className="font-mono"
            style={{
              fontWeight: active ? 800 : 600,
              textRendering: "geometricPrecision" as const,
              filter: active
                ? "drop-shadow(0 0 6px rgba(34,211,238,0.75))"
                : undefined,
            }}
          >
            {String(i)}
          </text>
        );
      })}
    </g>
  );
}

export function RingTheme({
  title,
  parts,
  targetAt,
}: {
  title: string;
  parts: TimeParts;
  targetAt: string;
}) {
  const dayRingCount = 32;
  const dayIndex = ((parts.days % dayRingCount) + dayRingCount) % dayRingCount;

  const rSec = 432;
  const rMin = 336;
  const rHour = 240;
  const rDay = 152;

  const fsSec = 19;
  const fsMin = 20;
  const fsHour = 21;
  const fsDay = 22;

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-[#020617] px-3 pb-16 pt-6 sm:pt-9">
      {/* 动态深空底 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(34,211,238,0.22), transparent 52%), radial-gradient(circle at 12% 88%, rgba(168,85,247,0.18), transparent 42%), radial-gradient(circle at 92% 18%, rgba(244,114,182,0.12), transparent 38%), #020617",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0 46px, rgba(255,255,255,0.35) 46px 47px, transparent 47px 92px)",
          backgroundSize: "92px 92px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

      {/* 外层机械轨道：多圈反向旋转 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute aspect-square w-[min(118vw,920px)] animate-[spin_72s_linear_infinite] rounded-full border-2 border-dashed border-cyan-500/20" />
        <div className="absolute aspect-square w-[min(104vw,820px)] animate-[spin_96s_linear_infinite] rounded-full border border-dashed border-fuchsia-500/15 [animation-direction:reverse]" />
        <div className="absolute aspect-square w-[min(90vw,700px)] animate-[spin_140s_linear_infinite] rounded-full border border-sky-400/10" />
      </div>

      <header className="relative z-30 order-1 w-full max-w-3xl px-4 pb-2 text-center sm:pb-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-cyan-300/90 sm:text-[11px]">
          当前任务
        </p>
        <h1 className="mt-2 text-balance bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-2xl font-extrabold leading-tight tracking-tight text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.35)] sm:text-4xl md:text-[2.6rem]">
          {title}
        </h1>
      </header>

      <div className="relative z-10 order-2 flex w-full flex-1 items-center justify-center py-2">
        <div className="relative aspect-square w-[min(98vw,760px)] max-h-[min(78dvh,760px)]">
          {/* 中心能量核 */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(54vw,360px)] w-[min(54vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/25 via-fuchsia-500/15 to-transparent blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <svg
            className="relative h-full w-full overflow-visible"
            viewBox={`0 0 ${VB} ${VB}`}
            aria-hidden
            style={{ textRendering: "geometricPrecision" }}
          >
            <defs>
              <linearGradient id="neonSec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecfeff" />
                <stop offset="45%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a5f3fc" />
              </linearGradient>
              <linearGradient id="neonMin" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fae8ff" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#e9d5ff" />
              </linearGradient>
              <linearGradient id="neonHr" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#fff7ed" />
              </linearGradient>
              <linearGradient id="neonDay" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffe4e6" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#fdf2f8" />
              </linearGradient>
              <linearGradient id="laserPtr" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(248,250,252,0)" />
                <stop offset="22%" stopColor="#f8fafc" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="100%" stopColor="rgba(217,70,239,0)" />
              </linearGradient>
              <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.8" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 装饰轨道圈 */}
            {[rSec + 18, rMin + 14, rHour + 10, rDay + 8].map((r, idx) => (
              <circle
                key={r}
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke="rgba(148,163,184,0.14)"
                strokeWidth={idx === 0 ? 1.2 : 0.9}
                strokeDasharray={idx % 2 === 0 ? "4 10" : "2 14"}
              />
            ))}

            <RingLayerSVG
              count={60}
              radius={rSec}
              fontSize={fsSec}
              activeIndex={parts.seconds}
              gradientId="neonSec"
              dimColor="#64748b"
            />
            <RingLayerSVG
              count={60}
              radius={rMin}
              fontSize={fsMin}
              activeIndex={parts.minutes}
              gradientId="neonMin"
              dimColor="#7c86a2"
            />
            <RingLayerSVG
              count={24}
              radius={rHour}
              fontSize={fsHour}
              activeIndex={parts.hours}
              gradientId="neonHr"
              dimColor="#8b93ab"
            />
            <RingLayerSVG
              count={dayRingCount}
              radius={rDay}
              fontSize={fsDay}
              activeIndex={dayIndex}
              gradientId="neonDay"
              dimColor="#94a3b8"
            />

            <line
              x1={CX}
              y1={CY}
              x2={CX + 438}
              y2={CY}
              stroke="url(#laserPtr)"
              strokeWidth={3}
              strokeLinecap="round"
              filter="url(#laserGlow)"
            />
            <circle
              cx={CX}
              cy={CY}
              r={8}
              fill="#f8fafc"
              style={{
                filter:
                  "drop-shadow(0 0 16px rgba(255,255,255,0.9)) drop-shadow(0 0 32px rgba(34,211,238,0.55))",
              }}
            />
          </svg>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex max-w-[15rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-cyan-400/35 bg-[#0b1220]/90 px-4 py-4 text-center shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_0_60px_rgba(34,211,238,0.18),0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:max-w-[17rem] sm:px-5">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10" />
            <p className="relative font-mono text-sm font-bold tabular-nums leading-snug text-zinc-50 sm:text-base">
              {parts.done
                ? "0d 0h 0m 0s"
                : `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`}
            </p>
            <p className="relative mt-2 text-[10px] font-medium leading-snug text-zinc-400 sm:text-xs">
              目标 · {formatTargetEn(targetAt)}
            </p>
          </div>
        </div>
      </div>

      {/* 轻微扫描线（过强会让细数字发糊） */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] mix-blend-overlay opacity-[0.018]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />
    </div>
  );
}
