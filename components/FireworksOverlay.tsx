"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
  gravity: number;
};

function spawnBurst(
  particles: Particle[],
  cx: number,
  cy: number,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 4 + Math.random() * 10;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1,
      maxLife: 0.85 + Math.random() * 0.35,
      hue: Math.random() * 60 + 300,
      size: 2 + Math.random() * 3,
      gravity: 0.12 + Math.random() * 0.06,
    });
  }
}

export function FireworksOverlay({
  active,
  onDone,
}: {
  active: boolean;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const onEnd = onDone;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let lastBurst = 0;
    const duration = 9000;
    const start = performance.now();

    const size = () => ({
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    const resize = () => {
      const { w, h, dpr } = size();
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.body);

    const tick = () => {
      const { w, h } = size();
      const elapsed = performance.now() - start;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (elapsed - lastBurst > 280 && elapsed < duration - 1200) {
        lastBurst = elapsed;
        for (let b = 0; b < 3; b++) {
          spawnBurst(
            particles,
            w * (0.15 + Math.random() * 0.7),
            h * (0.2 + Math.random() * 0.45),
            44 + Math.floor(Math.random() * 36),
          );
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.min(1, p.life / p.maxLife);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 62%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      if (elapsed < duration) {
        raf.current = requestAnimationFrame(tick);
      } else {
        onEnd?.();
      }
    };

    spawnBurst(particles, size().w * 0.35, size().h * 0.35, 80);
    spawnBurst(particles, size().w * 0.65, size().h * 0.38, 80);
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden
    />
  );
}
