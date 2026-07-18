export type TimeParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  done: boolean;
};

export function getTimeParts(targetAt: string, now = Date.now()): TimeParts {
  const end = new Date(targetAt).getTime();
  const totalMs = Math.max(0, end - now);

  if (!Number.isFinite(end) || totalMs <= 0) {
    const done = now >= end && Number.isFinite(end);
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, done };
  }

  const seconds = Math.floor(totalMs / 1000) % 60;
  const minutes = Math.floor(totalMs / (1000 * 60)) % 60;
  const hours = Math.floor(totalMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, totalMs, done: false };
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
