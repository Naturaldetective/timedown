"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { buildExportFile, downloadJson, parseImportJson } from "@/lib/config-io";
import type { CountdownTask, CountdownTheme } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";
import { getTimeParts } from "@/lib/time";
import { FireworksOverlay } from "./FireworksOverlay";
import { FlipTheme } from "./FlipTheme";
import { MarryTheme } from "./MarryTheme";
import { NeonTheme } from "./NeonTheme";
import { RingTheme } from "./RingTheme";

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultTasks(): CountdownTask[] {
  const t = new Date();
  t.setHours(t.getHours() + 2);
  t.setMinutes(0, 0, 0);
  return [
    {
      id: newId(),
      title: "下班倒计时",
      targetAt: t.toISOString(),
      theme: "flip",
    },
  ];
}

function loadTasks(): CountdownTask[] {
  if (typeof window === "undefined") return defaultTasks();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTasks();
    const parsed = JSON.parse(raw) as CountdownTask[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultTasks();
    return parsed.map((t) => ({
      ...t,
      theme:
        t.theme === "ring"
          ? "ring"
          : t.theme === "marry"
            ? "marry"
            : t.theme === "neon"
              ? "neon"
              : "flip",
    }));
  } catch {
    return defaultTasks();
  }
}

export function CountdownApp() {
  const [tasks, setTasks] = useState<CountdownTask[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const [fireworksDismissed, setFireworksDismissed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = loadTasks();
    setTasks(list);
    setActiveId(list[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!activeId) return;
    if (!tasks.some((t) => t.id === activeId)) {
      setActiveId(tasks[0]?.id ?? null);
    }
  }, [tasks, activeId]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const active = useMemo(
    () => tasks.find((t) => t.id === activeId) ?? tasks[0] ?? null,
    [tasks, activeId],
  );

  const parts = useMemo(
    () => (active ? getTimeParts(active.targetAt, now) : null),
    [active, now],
  );

  const done = parts?.done ?? false;

  useEffect(() => {
    if (done && active && !fireworksDismissed) {
      setFireworks(true);
    }
  }, [done, active, fireworksDismissed]);

  const tickKey = Math.floor(now / 1000);

  const updateTask = useCallback((id: string, patch: Partial<CountdownTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, []);

  const addTask = useCallback(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(18, 0, 0, 0);
    const task: CountdownTask = {
      id: newId(),
      title: "新倒计时",
      targetAt: t.toISOString(),
      theme: "flip",
    };
    setTasks((prev) => [...prev, task]);
    setActiveId(task.id);
    setFireworksDismissed(false);
    setFireworks(false);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setThemeForActive = useCallback(
    (theme: CountdownTheme) => {
      if (!active) return;
      updateTask(active.id, { theme });
    },
    [active, updateTask],
  );

  const exportConfig = useCallback(() => {
    const payload = buildExportFile(tasks);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadJson(`timedown-config-${stamp}.json`, payload);
  }, [tasks]);

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const list = parseImportJson(text);
          if (
            !window.confirm(
              `将用文件中的 ${list.length} 个任务替换当前全部任务，确定吗？`,
            )
          ) {
            return;
          }
          setTasks(list);
          setActiveId(list[0]?.id ?? null);
          setFireworksDismissed(false);
          setFireworks(false);
        } catch (err) {
          window.alert(
            err instanceof Error ? err.message : "导入失败，请检查文件格式",
          );
        }
      };
      reader.onerror = () => window.alert("无法读取文件");
      reader.readAsText(file, "utf-8");
    },
    [],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0f1115] text-zinc-500">
        加载中…
      </div>
    );
  }

  if (!active || !parts) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0f1115] px-6 text-center text-zinc-400">
        <p>暂无任务，请先新建。</p>
        <button
          type="button"
          onClick={() => {
            const list = defaultTasks();
            setTasks(list);
            setActiveId(list[0]!.id);
          }}
          className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
        >
          创建任务
        </button>
      </div>
    );
  }

  return (
    <>
      {active.theme === "flip" ? (
        <FlipTheme title={active.title} parts={parts} />
      ) : active.theme === "ring" ? (
        <RingTheme
          title={active.title}
          parts={parts}
          targetAt={active.targetAt}
        />
      ) : active.theme === "marry" ? (
        <MarryTheme title={active.title} parts={parts} />
      ) : active.theme === "neon" ? (
        <NeonTheme title={active.title} parts={parts} tickKey={tickKey} />
      ) : (
        <FlipTheme title={active.title} parts={parts} />
      )}

      <FireworksOverlay
        active={fireworks}
        onDone={() => {
          setFireworks(false);
        }}
      />

      {/* 控制条：外层 pointer-events-none，避免整块全宽遮罩抢走侧栏底部输入框的点击 */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center p-3 sm:p-4">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/85 px-3 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/15"
          >
            {panelOpen ? "收起任务" : "任务"}
          </button>

          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          <span className="text-xs text-zinc-500">主题</span>
          <div className="flex flex-wrap justify-center gap-0.5 rounded-xl bg-black/40 p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setThemeForActive("flip")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                active.theme === "flip"
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              翻页
            </button>
            <button
              type="button"
              onClick={() => setThemeForActive("ring")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                active.theme === "ring"
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              同心环
            </button>
            <button
              type="button"
              onClick={() => setThemeForActive("marry")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                active.theme === "marry"
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              婚礼
            </button>
            <button
              type="button"
              onClick={() => setThemeForActive("neon")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                active.theme === "neon"
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              赛博霓虹
            </button>
          </div>

          {done && (
            <button
              type="button"
              onClick={() => {
                setFireworksDismissed(true);
                setFireworks(false);
              }}
              className="rounded-xl bg-fuchsia-600/90 px-3 py-2 text-sm font-medium text-white ring-1 ring-fuchsia-400/40 hover:bg-fuchsia-500"
            >
              关闭烟花
            </button>
          )}
        </div>
      </div>

      {/* 任务侧栏 */}
      {panelOpen && (
        <aside className="fixed left-0 top-0 z-40 flex h-full w-[min(100%,320px)] flex-col border-r border-white/10 bg-zinc-950/90 pb-24 shadow-2xl backdrop-blur-xl sm:w-[340px]">
          <div className="border-b border-white/10 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">倒计时任务</h2>
            <p className="mt-1 text-xs text-zinc-500">点击切换；每项可单独选主题</p>
            <button
              type="button"
              onClick={addTask}
              className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
            >
              新建任务
            </button>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={exportConfig}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
              >
                导出配置
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
              >
                导入配置
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-600">
              导出为 JSON，可备份或在其他浏览器/设备导入（会覆盖当前列表）
            </p>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {tasks.map((t) => {
              const p = getTimeParts(t.targetAt, now);
              const isActive = t.id === active.id;
              return (
                <li key={t.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(t.id);
                      setFireworksDismissed(false);
                      if (getTimeParts(t.targetAt, Date.now()).done) {
                        setFireworks(true);
                      }
                    }}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-sky-500/50 bg-sky-500/10"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-medium text-zinc-100">
                        {t.title}
                      </span>
                      <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                        {t.theme === "flip"
                          ? "翻页"
                          : t.theme === "ring"
                            ? "同心环"
                            : t.theme === "marry"
                              ? "婚礼"
                              : t.theme === "neon"
                                ? "赛博霓虹"
                                : "时钟"}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {p.done ? "已结束" : `${p.days}天 ${p.hours}:${String(p.minutes).padStart(2, "0")}:${String(p.seconds).padStart(2, "0")}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/15"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(t.id, { theme: "flip" });
                        }}
                      >
                        主题：翻页
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/15"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(t.id, { theme: "clock" });
                        }}
                      >
                        主题：时钟
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/15"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(t.id, { theme: "ring" });
                        }}
                      >
                        主题：同心环
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/15"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(t.id, { theme: "marry" });
                        }}
                      >
                        主题：婚礼
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/15"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(t.id, { theme: "neon" });
                        }}
                      >
                        主题：赛博霓虹
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-rose-500/20 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTask(t.id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-white/10 p-4">
            <TaskEditor task={active} onSave={(patch) => updateTask(active.id, patch)} />
          </div>
        </aside>
      )}
    </>
  );
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function TaskEditor({
  task,
  onSave,
}: {
  task: CountdownTask;
  onSave: (patch: Partial<CountdownTask>) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-zinc-400">
        标题
        <input
          key={task.id}
          defaultValue={task.title}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== task.title) onSave({ title: v });
          }}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 focus:border-sky-500/50"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-400">
        目标时间（本地）
        <input
          type="datetime-local"
          key={`${task.id}-dt`}
          defaultValue={toDatetimeLocalValue(task.targetAt)}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            const next = new Date(v);
            if (!Number.isNaN(next.getTime())) {
              onSave({ targetAt: next.toISOString() });
            }
          }}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100"
        />
      </label>
    </div>
  );
}
