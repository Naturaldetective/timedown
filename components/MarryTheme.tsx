"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { pad2 } from "@/lib/time";
import type { TimeParts } from "@/lib/time";
import { FlipUnit } from "./FlipUnit";

/**
 * 婚礼动态背景：
 * - 视频：默认先试 /marry-bg.mp4，失败则试在线样片（确保能「看到在动」；可自行换成婚礼素材）
 * - 可设 NEXT_PUBLIC_MARRY_VIDEO_URL 覆盖为单一地址（此时不再用内置备用源）
 * - 全部失败或系统「减少动态效果」：高清图 + Ken Burns（CSS，不依赖 Next Image，国内网络更稳）
 */
const USER_VIDEO = process.env.NEXT_PUBLIC_MARRY_VIDEO_URL?.trim();

/** 公网可直连的短样片（非婚礼，仅作兜底；发布前可改为你的 CDN 婚礼 mp4） */
const FALLBACK_DEMO_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1529634806980-85c3dd6d588c?auto=format&fit=crop&w=1920&q=85";

function videoSources() {
  if (USER_VIDEO) return [{ src: USER_VIDEO, type: "video/mp4" as const }];
  return [
    { src: "/marry-bg.mp4", type: "video/mp4" as const },
    { src: FALLBACK_DEMO_MP4, type: "video/mp4" as const },
  ];
}

function PetalDrift() {
  const seeds = [8, 18, 28, 38, 48, 58, 68, 78, 22, 44, 66, 88, 15, 55, 92];
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {seeds.map((left, i) => (
        <span
          key={i}
          className="absolute -top-6 h-2.5 w-2.5 rounded-full bg-rose-200/70 shadow-[0_0_10px_rgba(251,113,133,0.5)]"
          style={{
            left: `${left}%`,
            animation: `marry-petals ${10 + (i % 5)}s linear infinite`,
            animationDelay: `${i * 0.55}s`,
          }}
        />
      ))}
    </div>
  );
}

function PhotoBackdrop({ animate }: { animate: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={`absolute inset-[-12%] bg-cover bg-[center_30%] ${
          animate
            ? "motion-safe:animate-[marry-kenburns_38s_ease-in-out_infinite_alternate]"
            : ""
        }`}
        style={{ backgroundImage: `url(${FALLBACK_PHOTO})` }}
      />
    </div>
  );
}

export function MarryTheme({
  title,
  parts,
}: {
  title: string;
  parts: TimeParts;
}) {
  const d = parts.days.toString();
  const h = pad2(parts.hours);
  const m = pad2(parts.minutes);
  const s = pad2(parts.seconds);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDead, setVideoDead] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** 浏览器多数禁止有声自动播放：默认静音；用户点击「开启声音」后可播放视频音轨 */
  const [videoMuted, setVideoMuted] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (videoDead || reduceMotion) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = videoMuted;
    void el.play().catch(() => {
      if (!videoMuted) {
        el.muted = true;
        setVideoMuted(true);
        void el.play().catch(() => {});
      }
    });
  }, [videoDead, reduceMotion, videoMuted]);

  const toggleVideoSound = () => {
    const el = videoRef.current;
    if (!el || videoDead || reduceMotion) return;
    if (!videoMuted) {
      el.muted = true;
      setVideoMuted(true);
      return;
    }
    el.muted = false;
    el.volume = 1;
    void el.play().then(
      () => setVideoMuted(false),
      () => {
        el.muted = true;
        setVideoMuted(true);
        void el.play().catch(() => {});
      },
    );
  };

  const showPhotoOnly = videoDead || reduceMotion;
  const sources = videoSources();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#1a0a12]">
      <div className="absolute inset-0 z-0">
        {showPhotoOnly ? (
          <PhotoBackdrop animate={!reduceMotion} />
        ) : (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
            autoPlay
            muted={videoMuted}
            loop
            playsInline
            preload="auto"
            poster={FALLBACK_PHOTO}
            onError={() => setVideoDead(true)}
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        )}
      </div>

      <PetalDrift />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,6,14,0.5) 0%, rgba(8,6,14,0.12) 42%, rgba(8,6,14,0.32) 65%, rgba(8,6,14,0.82) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_50%_38%,transparent_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.68)_100%)]" />

      {!showPhotoOnly && (
        <div className="pointer-events-auto fixed right-4 top-[5.5rem] z-[25] sm:top-24">
          <button
            type="button"
            onClick={toggleVideoSound}
            className="rounded-xl border border-white/25 bg-black/45 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md ring-1 ring-white/10 hover:bg-black/55 sm:text-sm"
          >
            {videoMuted ? "🔇 开启视频声音" : "🔊 静音"}
          </button>
          {videoMuted && (
            <p className="mt-1 max-w-[11rem] text-[10px] leading-snug text-white/70 drop-shadow">
              有声播放需手动开启（浏览器限制自动有声播放）
            </p>
          )}
        </div>
      )}

      <div className="relative z-20 flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-28 pt-10">
        <div className="mb-8 max-w-xl text-center">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.35em] text-white/88 drop-shadow-md">
            当前任务
          </p>
          <h1 className="text-balance text-xl font-semibold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)] sm:text-2xl md:text-[1.85rem]">
            {title}
          </h1>
        </div>

        <motion.div
          className="relative rounded-[1.75rem] border border-white/80 bg-white/[0.94] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-rose-100/90 backdrop-blur-md sm:px-10 sm:py-10"
          initial={false}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-white/95 via-rose-50/70 to-white/90 opacity-95" />
          <div className="relative flex flex-wrap items-end justify-center gap-5 sm:gap-8 md:gap-10">
            <FlipUnit label="天" value={d} />
            <FlipUnit label="时" value={h} narrow />
            <FlipUnit label="分" value={m} narrow />
            <FlipUnit label="秒" value={s} narrow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
