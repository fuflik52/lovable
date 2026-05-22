import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Page } from "@/components/shop";
import ammoImg from "@/assets/ammo.webp";

type View = "schedule" | "block";

export const Route = createFileRoute("/wipes")({
  validateSearch: (s: Record<string, unknown>): { view?: View } => ({
    view: s.view === "block" ? "block" : s.view === "schedule" ? "schedule" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Вайпы — PUBLIC RUST" },
      { name: "description", content: "Расписание вайпов и вайп-блок на серверах PUBLIC RUST." },
    ],
  }),
  component: WipesPage,
});

const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: "schedule", label: "Расписание вайпов", icon: "solar:calendar-bold-duotone" },
  { id: "block", label: "Вайп блок", icon: "solar:lock-keyhole-bold-duotone" },
];

function WipesPage() {
  const search = useSearch({ from: "/wipes" });
  const navigate = useNavigate({ from: "/wipes" });
  const view: View = search.view ?? "schedule";
  const setView = (v: View) => navigate({ search: { view: v } });
  const current = VIEWS.find((v) => v.id === view)!;
  const [open, setOpen] = useState(false);



  return (
    <Page>
      <div className="max-w-[860px] mx-auto py-6">
        {/* Dropdown switcher */}
        <div className="relative mb-6 w-full sm:w-[300px]">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2.5 hover:border-[var(--icon)] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg accent-bg flex items-center justify-center">
              <Icon name={current.icon} size={14} color="#ffffff" />
            </div>
            <span className="text-[13px] font-semibold text-[var(--fg)] flex-1 text-left">
              {current.label}
            </span>
            <Icon
              name="solar:alt-arrow-down-bold-duotone"
              size={14}
              color="#9A9A9A"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-[0_20px_50px_-12px_rgba(0,0,0,.2)] overflow-hidden"
              >
                {VIEWS.map((v) => {
                  const isActive = v.id === view;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setView(v.id);
                        setOpen(false);
                      }}
                      className={`w-full px-3 h-11 flex items-center gap-2.5 text-[13px] transition-colors ${
                        isActive
                          ? "bg-[var(--surface)] text-[var(--fg)] font-semibold"
                          : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <Icon name={v.icon} size={15} color={isActive ? "#2079FF" : "#9A9A9A"} />
                      {v.label}
                    </button>
                  );
                })}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {view === "schedule" ? <ScheduleView /> : <BlockView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Page>
  );
}

/* ============ Schedule (calendar) ============ */
type WipeInfo = { type: "full" | "bp" | "map"; rate: string; server: string; time: string };
const WIPE_INFO: Record<number, WipeInfo> = {
  4: { type: "full", rate: "2X", server: "MAIN 2X", time: "14:00 МСК" },
  11: { type: "map", rate: "2X", server: "MAIN 2X", time: "14:00 МСК" },
  18: { type: "bp", rate: "5X", server: "LITE 5X", time: "15:00 МСК" },
  25: { type: "full", rate: "1X", server: "HARD 1X", time: "12:00 МСК" },
};
const WIPE_META = {
  full: { label: "Полный вайп", color: "#ef4444" },
  bp: { label: "Вайп BP", color: "#f59e0b" },
  map: { label: "Только карта", color: "#22c55e" },
};

function ScheduleView() {
  const [offset, setOffset] = useState(0);
  const base = new Date(2026, 4, 21);
  const today = base.getDate();
  const baseMonth = base.getMonth();
  const baseYear = base.getFullYear();
  const v = useMemo(() => {
    const d = new Date(baseYear, baseMonth + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [offset, baseMonth, baseYear]);

  const monthName = new Date(v.year, v.month, 1).toLocaleString("ru-RU", { month: "long" });
  const first = new Date(v.year, v.month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(v.year, v.month + 1, 0).getDate();
  const prevMonthDays = new Date(v.year, v.month, 0).getDate();
  const isCurrentMonth = v.year === baseYear && v.month === baseMonth;

  const cells: { day: number; muted: boolean }[] = [
    ...Array.from({ length: startOffset }, (_, i) => ({
      day: prevMonthDays - startOffset + i + 1,
      muted: true,
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, muted: false })),
  ];
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - startOffset - daysInMonth + 1, muted: true });
  }

  return (
    <div className="max-w-[520px]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--icon)] transition-colors"
            aria-label="Предыдущий месяц"
          >
            <Icon name="solar:arrow-left-linear" size={14} color="#9A9A9A" />
          </button>
          <div className="text-[13px] font-semibold text-[var(--fg)] capitalize">
            {monthName} {v.year}
          </div>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--icon)] transition-colors"
            aria-label="Следующий месяц"
          >
            <Icon name="solar:arrow-right-linear" size={14} color="#9A9A9A" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1.5">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => (
            <div
              key={d}
              className={`text-center text-[10px] uppercase tracking-wider py-1.5 ${
                i >= 5 ? "text-[#f59e0b]/70" : "text-[var(--muted)]"
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--border)] gap-px">
          {cells.map((c, i) => {
            const isToday = !c.muted && isCurrentMonth && c.day === today;
            const wipe = !c.muted ? WIPE_INFO[c.day] : undefined;
            const meta = wipe ? WIPE_META[wipe.type] : null;
            const isWeekend = i % 7 >= 5;
            return (
              <div key={i} className="relative group aspect-square bg-[var(--bg)]">
                <button
                  type="button"
                  disabled={c.muted}
                  className={`w-full h-full flex flex-col items-center justify-center gap-0.5 text-[12px] font-semibold tabular-nums transition-all ${
                    c.muted
                      ? "text-[var(--muted)] opacity-30 cursor-default"
                      : isToday
                      ? "bg-[#22c55e] text-white"
                      : meta
                      ? "text-[var(--fg)] hover:bg-[var(--surface)]"
                      : `${isWeekend ? "text-[var(--muted)]" : "text-[var(--fg)]"} hover:bg-[var(--surface)]`
                  }`}
                >
                  <span>{c.day}</span>
                  {meta ? (
                    <span className="w-1 h-1 rounded-full" style={{ background: meta.color }} />
                  ) : null}
                </button>

                {!c.muted ? (
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative whitespace-nowrap rounded-lg bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium px-2.5 py-1.5 shadow-[0_8px_20px_-6px_rgba(0,0,0,.3)]">
                      {isToday ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                          Сегодня · {c.day} {monthName}
                        </span>
                      ) : wipe && meta ? (
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                            {meta.label} · {wipe.rate}
                          </span>
                          <span className="opacity-70 text-[10px]">
                            {wipe.server} · {wipe.time}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-80">
                          {c.day} {monthName} · обычный день
                        </span>
                      )}
                      <span
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: "5px solid var(--fg)",
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]" />
            <span className="text-[var(--muted)]">Сегодня</span>
          </div>
          {Object.entries(WIPE_META).map(([k, val]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: val.color }} />
              <span className="text-[var(--muted)]">{val.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ============ Wipe Block ============ */
type BlockItem = {
  label: string;
  hours: number;
  /** seconds elapsed since wipe (for the per-item fill bar) */
  elapsed: number;
};

const ITEMS: BlockItem[] = [
  { label: "Патрон 5.56", hours: 1, elapsed: 1800 },        // 30 min / 1h  => 50%
  { label: "Патрон пистолетный", hours: 1, elapsed: 3000 }, // 50 min / 1h  => ~83%
  { label: "Автомат AK", hours: 3, elapsed: 5400 },          // 1.5h / 3h    => 50%
  { label: "L96", hours: 6, elapsed: 7200 },                 // 2h / 6h      => 33%
  { label: "Ракетница", hours: 12, elapsed: 1800 },          // 30m / 12h    => 4%
  { label: "C4", hours: 24, elapsed: 600 },                  // 10m / 24h    => tiny
  { label: "Пистолет MP5", hours: 3, elapsed: 10800 },       // готово
  { label: "Дробовик", hours: 1, elapsed: 3600 },            // готово
];

function formatRemaining(sec: number) {
  if (sec <= 0) return "готово";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}ч ${m.toString().padStart(2, "0")}м`;
  if (m > 0) return `${m}м ${s.toString().padStart(2, "0")}с`;
  return `${s}с`;
}

/** Live ticking remaining seconds for an item. */
function useRemaining(item: BlockItem) {
  const total = item.hours * 3600;
  const [elapsed, setElapsed] = useState(item.elapsed);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000);
    return () => clearInterval(t);
  }, [total]);
  const remaining = Math.max(0, total - elapsed);
  const progress = Math.min(1, elapsed / total); // 0..1 (1 = разблокировано)
  return { remaining, progress, total, available: remaining === 0 };
}

/* ---------- Строка-список оружия ---------- */
function WeaponRow({ item }: { item: BlockItem }) {
  const { remaining, progress, available } = useRemaining(item);
  const accent = available ? "#22c55e" : "#ef4444";

  return (
    <div className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[.02] transition-colors">
      {/* icon */}
      <div className="relative w-10 h-10 rounded-lg bg-[#161616] border border-white/[.05] flex items-center justify-center shrink-0">
        <img src={ammoImg} alt={item.label} className="w-[75%] h-[75%] object-contain" />
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#0e0e0e]"
          style={{ background: accent }}
        />
      </div>

      {/* name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <div className="text-[13px] font-medium text-[var(--fg)] truncate">{item.label}</div>
          <div
            className="text-[11px] font-semibold tabular-nums shrink-0"
            style={{ color: available ? "#86efac" : "var(--muted)" }}
          >
            {available ? "разблокировано" : formatRemaining(remaining)}
          </div>
        </div>
        <div className="h-[3px] w-full rounded-full bg-white/[.04] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Верхний минималистичный таймер ---------- */
function TopTimer() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = useMemo(() => {
    let best: { label: string; remaining: number } | null = null;
    for (const it of ITEMS) {
      const total = it.hours * 3600;
      const remaining = Math.max(0, total - (it.elapsed + tick));
      if (remaining > 0 && (!best || remaining < best.remaining)) {
        best = { label: it.label, remaining };
      }
    }
    return best;
  }, [tick]);

  const unlocked = ITEMS.filter((it) => it.elapsed + tick >= it.hours * 3600).length;

  return (
    <div className="mb-4 flex items-center justify-between gap-4 px-1">
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-[#22c55e] opacity-60 animate-ping" />
          <span className="relative w-2 h-2 rounded-full bg-[#22c55e]" />
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Следующее
        </span>
        <span className="text-[12px] font-semibold text-[var(--fg)] truncate">
          {next ? next.label : "всё разблокировано"}
        </span>
        {next ? (
          <span className="text-[12px] font-bold tabular-nums text-[var(--fg)]">
            · {formatRemaining(next.remaining)}
          </span>
        ) : null}
      </div>
      <div className="text-[11px] tabular-nums text-[var(--muted)] shrink-0">
        <span className="text-[#22c55e] font-bold">{unlocked}</span>
        <span className="opacity-60"> / {ITEMS.length} доступно</span>
      </div>
    </div>
  );
}

function BlockView() {
  const sorted = useMemo(
    () => [...ITEMS].sort((a, b) => {
      const ra = Math.max(0, a.hours * 3600 - a.elapsed);
      const rb = Math.max(0, b.hours * 3600 - b.elapsed);
      if ((ra === 0) !== (rb === 0)) return ra === 0 ? 1 : -1;
      return ra - rb;
    }),
    []
  );

  return (
    <div>
      <TopTimer />
      <div className="rounded-xl border border-white/[.06] bg-[#0e0e0e] p-1.5 divide-y divide-white/[.04]">
        {sorted.map((it, i) => (
          <WeaponRow key={i} item={it} />
        ))}
      </div>
    </div>
  );
}




