"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { pad2 } from "@/lib/time";
import type { TimeParts } from "@/lib/time";

/* ── 数据流雨背景 ── */
function DataRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    function init() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    }

    init();
    window.addEventListener("resize", init);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(3, 3, 5, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(34, 211, 238, 0.15)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle =
          Math.random() > 0.98
            ? "rgba(232, 121, 249, 0.3)"
            : "rgba(34, 211, 238, 0.12)";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  );
}

/* ── 故障文字 ── */
function GlitchText({ text }: { text: string }) {
  return (
    <div className="relative inline-block">
      <span className="relative z-10">{text}</span>
      <span
        className="pointer-events-none absolute left-0 top-0 -z-10 text-cyan-400/80"
        style={{
          clipPath: "inset(20% 0 40% 0)",
          transform: "translate(3px, -2px)",
          animation: "glitch1 2.5s infinite linear alternate-reverse",
        }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="pointer-events-none absolute left-0 top-0 -z-10 text-fuchsia-400/80"
        style={{
          clipPath: "inset(60% 0 10% 0)",
          transform: "translate(-3px, 2px)",
          animation: "glitch2 3s infinite linear alternate-reverse",
        }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="pointer-events-none absolute left-0 top-0 -z-10 text-yellow-400/60"
        style={{
          clipPath: "inset(40% 0 30% 0)",
          transform: "translate(1px, 1px)",
          animation: "glitch3 2s infinite linear alternate-reverse",
        }}
        aria-hidden
      >
        {text}
      </span>
    </div>
  );
}

/* ── 赛博数字卡片 ── */
function CyberDigit({ value, label }: { value: string; label: string }) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* 外框 */}
      <div
        className={`relative overflow-hidden rounded-sm border bg-black/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-5 ${
          glitch
            ? "border-fuchsia-500/80 shadow-[0_0_40px_rgba(232,121,249,0.4)]"
            : "border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2),inset_0_0_30px_rgba(34,211,238,0.05)]"
        }`}
      >
        {/* 顶部霓虹线 */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        {/* 底部霓虹线 */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
        {/* 左侧装饰线 */}
        <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-gradient-to-b from-cyan-500/60 via-transparent to-fuchsia-500/60" />
        {/* 右侧装饰线 */}
        <div className="absolute bottom-0 right-0 top-0 w-[2px] bg-gradient-to-b from-fuchsia-500/60 via-transparent to-cyan-500/60" />

        {/* 内部扫描光 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/8 via-transparent to-fuchsia-500/8"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* 数字 */}
        <span
          className={`relative z-10 font-mono text-5xl font-black tabular-nums sm:text-7xl md:text-8xl ${
            glitch
              ? "text-fuchsia-300 drop-shadow-[0_0_20px_rgba(232,121,249,0.8)]"
              : "text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]"
          }`}
          style={{
            transform: glitch ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : "none",
          }}
        >
          {value}
        </span>

        {/* 四角标记 */}
        <div className="absolute left-1.5 top-1.5 h-2 w-2 border-l-2 border-t-2 border-cyan-400/70" />
        <div className="absolute right-1.5 top-1.5 h-2 w-2 border-r-2 border-t-2 border-cyan-400/70" />
        <div className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b-2 border-l-2 border-fuchsia-400/70" />
        <div className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b-2 border-r-2 border-fuchsia-400/70" />

        {/* 内部网格线 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      </div>

      {/* 标签 */}
      <div className="flex items-center gap-1.5">
        <div className="h-px w-3 bg-cyan-500/50" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400/70 sm:text-[10px]">
          {label}
        </span>
        <div className="h-px w-3 bg-cyan-500/50" />
      </div>
    </div>
  );
}

/* ── 冒号 ── */
function CyberColon() {
  return (
    <div className="flex h-full items-center pb-8 sm:pb-10">
      <motion.div
        className="flex flex-col gap-3 sm:gap-4"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
      >
        <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] sm:h-3.5 sm:w-3.5" />
        <div className="h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,1)] sm:h-3.5 sm:w-3.5" />
      </motion.div>
    </div>
  );
}

/* ── 浮动粒子 ── */
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        color: Math.random() > 0.5 ? "rgba(34,211,238,0.4)" : "rgba(168,85,247,0.3)",
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── 六边形装饰 ── */
function HexDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
      {/* 旋转六边形 */}
      <motion.svg
        className="absolute h-[min(120vw,800px)] w-[min(120vw,800px)]"
        viewBox="0 0 400 400"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <polygon
          points="200,20 360,110 360,290 200,380 40,290 40,110"
          fill="none"
          stroke="rgba(34,211,238,0.06)"
          strokeWidth="1"
          strokeDasharray="8 12"
        />
      </motion.svg>
      <motion.svg
        className="absolute h-[min(100vw,680px)] w-[min(100vw,680px)]"
        viewBox="0 0 400 400"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <polygon
          points="200,40 340,120 340,280 200,360 60,280 60,120"
          fill="none"
          stroke="rgba(168,85,247,0.05)"
          strokeWidth="1"
          strokeDasharray="4 16"
        />
      </motion.svg>
    </div>
  );
}

export function NeonTheme({
  title,
  parts,
  tickKey,
}: {
  title: string;
  parts: TimeParts;
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

  const pulse = useTransform(secondSpring, (v) => 1 + Math.sin(v * Math.PI) * 0.04);

  useEffect(() => {
    secondSpring.set(parts.seconds);
  }, [parts.seconds, secondSpring]);

  const progress = useMemo(() => {
    const totalSeconds = parts.days * 86400 + parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
    const maxSeconds = 30 * 86400;
    return Math.min(totalSeconds / maxSeconds, 1);
  }, [parts]);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#030305]">
      {/* CSS 动画 */}
      <style>{`
        @keyframes glitch1 {
          0% { clip-path: inset(20% 0 40% 0); transform: translate(3px, -2px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(-2px, 1px); }
          40% { clip-path: inset(10% 0 70% 0); transform: translate(2px, 3px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(-1px, -2px); }
          80% { clip-path: inset(30% 0 50% 0); transform: translate(1px, 2px); }
          100% { clip-path: inset(50% 0 20% 0); transform: translate(-3px, -1px); }
        }
        @keyframes glitch2 {
          0% { clip-path: inset(60% 0 10% 0); transform: translate(-3px, 2px); }
          25% { clip-path: inset(20% 0 50% 0); transform: translate(2px, -1px); }
          50% { clip-path: inset(70% 0 15% 0); transform: translate(-1px, 3px); }
          75% { clip-path: inset(40% 0 30% 0); transform: translate(3px, -2px); }
          100% { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 1px); }
        }
        @keyframes glitch3 {
          0% { clip-path: inset(40% 0 30% 0); transform: translate(1px, 1px); }
          33% { clip-path: inset(15% 0 55% 0); transform: translate(-2px, -1px); }
          66% { clip-path: inset(65% 0 10% 0); transform: translate(2px, 2px); }
          100% { clip-path: inset(30% 0 40% 0); transform: translate(-1px, -2px); }
        }
        @keyframes ticker {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>

      {/* 背景层 */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(circle at 85% 85%, rgba(168,85,247,0.14), transparent 45%), radial-gradient(circle at 15% 70%, rgba(236,72,153,0.1), transparent 40%), #030305",
          }}
        />
      </div>

      {/* 数据流雨 */}
      <DataRain />

      {/* 浮动粒子 */}
      <FloatingParticles />

      {/* 六边形装饰 */}
      <HexDecor />

      {/* CRT 扫描线 */}
      <div
        className="pointer-events-none fixed inset-0 z-[5] opacity-[0.035]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.4) 1px, rgba(255,255,255,0.4) 2px)",
        }}
      />

      {/* 扫描光束 */}
      <motion.div
        className="pointer-events-none fixed left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.6)]"
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent"
        animate={{ top: ["102%", "-2%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      {/* 左上 HUD */}
      <div className="pointer-events-none fixed left-3 top-3 z-30 hidden font-mono text-[9px] leading-relaxed text-cyan-500/50 sm:block">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>SYS.TIMEDOWN v2.0.77</span>
        </div>
        <div>MODE: NEON_CYBER</div>
        <div className="text-fuchsia-500/50">STATUS: ACTIVE</div>
        <div className="mt-1 text-[8px] text-cyan-500/30">
          MEM: 2048MB // CPU: 12%
        </div>
      </div>

      {/* 右上 HUD */}
      <div className="pointer-events-none fixed right-3 top-3 z-30 hidden text-right font-mono text-[9px] leading-relaxed text-cyan-500/50 sm:block">
        <div>LAT: 35.6762°N</div>
        <div>LON: 139.6503°E</div>
        <div className="text-fuchsia-500/50">TOKYO // 2088</div>
        <div className="mt-1 text-[8px] text-cyan-500/30">
          FREQ: 2.4GHz // PING: 3ms
        </div>
      </div>

      {/* 任务标题 */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex flex-col items-center px-4 pb-3 pt-10 text-center sm:pt-14">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-gradient-to-r from-transparent to-cyan-500/60" />
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-cyan-300/80 sm:text-[10px]">
            当前任务 // CURRENT TARGET
          </span>
          <div className="h-px w-6 bg-gradient-to-l from-transparent to-cyan-500/60" />
        </div>
        <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl md:text-[2.5rem]">
          <GlitchText text={title} />
        </h2>
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-28 pt-36 sm:pt-40">
        <motion.div
          key={tickKey}
          className="relative flex flex-col items-center justify-center"
          initial={{ x: 0 }}
          animate={{
            x: [0, -4, 3, -2, 1, 0],
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* 外发光 */}
          <motion.div
            className="absolute h-[min(85vw,480px)] w-[min(85vw,480px)] rounded-full bg-gradient-to-tr from-cyan-500/20 via-fuchsia-500/15 to-pink-500/20 blur-[80px]"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, -12, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div style={{ scale: pulse }} className="relative flex flex-col items-center gap-5">
            {/* 倒计时 */}
            <div className="flex items-end gap-1 sm:gap-2 md:gap-3">
              <CyberDigit value={h} label="时 / HR" />
              <CyberColon />
              <CyberDigit value={m} label="分 / MIN" />
              <CyberColon />
              <CyberDigit value={s} label="秒 / SEC" />
            </div>

            {/* 天数徽章 */}
            <motion.div
              className="relative flex items-center gap-3 rounded-sm border border-cyan-500/40 bg-black/60 px-5 py-2.5 backdrop-blur-sm"
              animate={{
                boxShadow: [
                  "0 0 15px rgba(34,211,238,0.15)",
                  "0 0 40px rgba(168,85,247,0.25)",
                  "0 0 15px rgba(34,211,238,0.15)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {/* 边框装饰 */}
              <div className="absolute left-0 top-0 h-[2px] w-4 bg-cyan-400/80" />
              <div className="absolute right-0 top-0 h-[2px] w-4 bg-fuchsia-400/80" />
              <div className="absolute bottom-0 left-0 h-[2px] w-4 bg-fuchsia-400/80" />
              <div className="absolute bottom-0 right-0 h-[2px] w-4 bg-cyan-400/80" />

              <span className="text-[10px] text-cyan-400/70 sm:text-xs">剩余 / REMAINING</span>
              <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                {parts.days}
              </span>
              <span className="text-[10px] text-fuchsia-400/70 sm:text-xs">天 / DAYS</span>

              {/* 动态音频条 */}
              <div className="ml-3 flex h-5 items-end gap-[3px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-sm bg-gradient-to-t from-cyan-500 to-fuchsia-500"
                    animate={{ height: ["20%", `${40 + Math.random() * 60}%`, "20%"] }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* 进度环 */}
            <div className="relative mt-3 h-[min(65vw,240px)] w-[min(65vw,240px)] sm:h-[min(55vw,280px)] sm:w-[min(55vw,280px)]">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="3" />
                <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(168,85,247,0.04)" strokeWidth="1" strokeDasharray="2 6" />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#neonGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={false}
                  animate={{ strokeDashoffset }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  filter="url(#glow)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/60 sm:text-[10px]">
                  进度 / PROGRESS
                </span>
                <span className="font-mono text-3xl font-black text-white sm:text-4xl">
                  {Math.round((1 - progress) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 底部跑马灯 */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 overflow-hidden border-t border-cyan-500/25 bg-black/50 py-1.5 backdrop-blur-sm">
        <div
          className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400/60"
          style={{ animation: "ticker 18s linear infinite" }}
        >
          ◆ SYSTEM ONLINE ◆ TARGET LOCKED ◆ COUNTDOWN ACTIVE ◆ STAY SHARP ◆ THE FUTURE IS WAITING ◆ NEXUS PROTOCOL v4.2 ◆ ALL SYSTEMS NOMINAL ◆
        </div>
      </div>

      {/* 底部霓虹线 */}
      <div className="pointer-events-none fixed bottom-8 left-0 right-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
    </div>
  );
}
