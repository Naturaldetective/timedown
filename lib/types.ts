export type CountdownTheme = "flip" | "clock" | "ring" | "marry" | "neon";

export type CountdownTask = {
  id: string;
  title: string;
  /** ISO 8601 目标时间 */
  targetAt: string;
  theme: CountdownTheme;
};

export const STORAGE_KEY = "timedown-tasks-v1";
