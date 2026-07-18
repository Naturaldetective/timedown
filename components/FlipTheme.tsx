"use client";

import { pad2 } from "@/lib/time";
import type { TimeParts } from "@/lib/time";
import { FlipUnit } from "./FlipUnit";

export function FlipTheme({
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

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#12151c] px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(61,124,255,0.12), transparent 45%), radial-gradient(circle at 80% 10%, rgba(120,180,255,0.08), transparent 40%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.04), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_32px] opacity-30" />

      {/* 标题 + 翻页作为一整块在视口正中 */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 sm:gap-12">
        <header className="max-w-2xl text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-zinc-500">
            当前任务
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl md:text-[2rem]">
            {title}
          </h1>
        </header>

        <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10 md:gap-14">
          <FlipUnit label="天" value={d} />
          <FlipUnit label="时" value={h} narrow />
          <FlipUnit label="分" value={m} narrow />
          <FlipUnit label="秒" value={s} narrow />
        </div>
      </div>
    </div>
  );
}
