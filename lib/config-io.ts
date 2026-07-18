import type { CountdownTask, CountdownTheme } from "./types";

export const CONFIG_EXPORT_VERSION = 1;

export type TimedownConfigFile = {
  version: number;
  exportedAt: string;
  app: "timedown";
  tasks: CountdownTask[];
};

function normalizeTheme(v: unknown): CountdownTheme {
  const t = String(v ?? "flip");
  if (t === "clock") return "clock";
  if (t === "ring") return "ring";
  if (t === "marry") return "marry";
  return "flip";
}

function parseTaskList(tasks: unknown, label: string): CountdownTask[] {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error(`${label}中没有任务`);
  }
  const out: CountdownTask[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const item = tasks[i];
    if (typeof item !== "object" || item === null) {
      throw new Error(`第 ${i + 1} 条格式无效`);
    }
    const t = item as Record<string, unknown>;
    const id = typeof t.id === "string" && t.id.trim() ? t.id.trim() : "";
    const title =
      typeof t.title === "string" ? t.title.trim() : String(t.title ?? "").trim();
    const targetAtRaw =
      typeof t.targetAt === "string" ? t.targetAt : String(t.targetAt ?? "");
    if (!id || !title) {
      throw new Error(`第 ${i + 1} 条缺少 id 或标题`);
    }
    const d = new Date(targetAtRaw);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`第 ${i + 1} 条目标时间无效`);
    }
    out.push({
      id,
      title,
      targetAt: d.toISOString(),
      theme: normalizeTheme(t.theme),
    });
  }
  return out;
}

/** 解析导出的 JSON 文本：支持 { version, tasks } 或纯任务数组（与 localStorage 一致） */
export function parseImportJson(text: string): CountdownTask[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new Error("不是合法的 JSON");
  }
  if (Array.isArray(raw)) {
    return parseTaskList(raw, "文件");
  }
  if (typeof raw === "object" && raw !== null && "tasks" in raw) {
    return parseTaskList(
      (raw as { tasks: unknown }).tasks,
      "文件",
    );
  }
  throw new Error("JSON 需为任务数组，或包含 tasks 字段的对象");
}

export function buildExportFile(tasks: CountdownTask[]): TimedownConfigFile {
  return {
    version: CONFIG_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: "timedown",
    tasks: tasks.map((t) => ({ ...t })),
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
