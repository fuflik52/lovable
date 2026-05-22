import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

/* ============ Iconify icon ============ */
export function Icon({
  name,
  size = 18,
  color,
  className = "",
}: {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const c = color ?? "#9A9A9A";
  const url = `https://api.iconify.design/${name}.svg?color=${encodeURIComponent(c)}`;
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}

/* ============ Tooltip icon ============ */
export function TooltipIcon({
  icon,
  tooltip,
  color = "#9A9A9A",
  size = 18,
}: {
  icon: string;
  tooltip: string;
  color?: string;
  size?: number;
}) {
  return (
    <div className="relative group inline-flex">
      <Icon name={icon} size={size} color={color} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--fg)] font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-lg pointer-events-none z-50">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[var(--border)]" />
      </div>
    </div>
  );
}

/* ============ Animated rolling number ============ */
export function AnimatedNumber({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  const str = String(value);
  return (
    <span className={`inline-flex overflow-hidden align-baseline leading-[1.1] ${className}`}>
      {str.split("").map((char, i) => {
        const isDigit = /[0-9]/.test(char);
        return (
          <span key={i} className="relative inline-block overflow-hidden" style={{ height: "1.1em" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={isDigit ? `${i}-${char}` : `s-${i}-${char}`}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                className="inline-block tabular-nums"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

/* ============ Mock user ============ */
export const USER = {
  nick: "PlayerOne",
  steamId: "76561199634589620",
  balance: 4.95,
};

/* ============ Purchase history store ============ */
export type Purchase = {
  id: string;
  itemId: number;
  name: string;
  img: string;
  qty: number;
  price: number;
  server: string;
  date: string; // dd.mm.yyyy
  time: string; // HH:MM
  status: "Выдано" | "В обработке";
};

let historyState: Purchase[] = [
  {
    id: "A-2451",
    itemId: 102,
    name: "HV 5.56 Rifle Ammo",
    img: "https://cdn.gamestores.app/img/games/rust/1712070256.webp",
    qty: 12,
    price: 12.5,
    server: "PUBLIC RUST #1 X2",
    date: "12.05.2026",
    time: "18:42",
    status: "Выдано",
  },
  {
    id: "A-2398",
    itemId: 103,
    name: "Burlap Trousers",
    img: "https://cdn.gamestores.app/img/games/rust/blueprintbase.png",
    qty: 1,
    price: 49.9,
    server: "PUBLIC RUST #2 X5",
    date: "08.05.2026",
    time: "21:15",
    status: "Выдано",
  },
  {
    id: "A-2301",
    itemId: 201,
    name: "Wood",
    img: "https://cdn.gamestores.app/img/games/rust/wood.png",
    qty: 1000,
    price: 1,
    server: "PUBLIC RUST #3 Vanilla",
    date: "01.05.2026",
    time: "13:08",
    status: "Выдано",
  },
];

const historyListeners = new Set<(c: Purchase[]) => void>();
const emitHistory = () => historyListeners.forEach((l) => l([...historyState]));

export function useHistory() {
  const [items, setItems] = useState<Purchase[]>([...historyState]);
  useEffect(() => {
    historyListeners.add(setItems);
    return () => {
      historyListeners.delete(setItems);
    };
  }, []);
  return items;
}

const pad = (n: number) => String(n).padStart(2, "0");
const nowDate = () => {
  const d = new Date();
  return {
    date: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};
let orderCounter = 2452;

export const cart = {
  add(item: { id: number; name: string; img: string; price: number; qty?: number; server?: string }) {
    const { date, time } = nowDate();
    const purchase: Purchase = {
      id: `A-${orderCounter++}`,
      itemId: item.id,
      name: item.name,
      img: item.img,
      qty: item.qty ?? 1,
      price: item.price,
      server: item.server ?? "Любой",
      date,
      time,
      status: "Выдано",
    };
    historyState = [purchase, ...historyState];
    emitHistory();
  },
  refund(id: string) {
    historyState = historyState.filter((p) => p.id !== id);
    emitHistory();
  },
};

export const SERVERS = ["Любой", "PUBLIC RUST #1 X2", "PUBLIC RUST #2 X5", "PUBLIC RUST #3 Vanilla"];


/* ============ Toasts ============ */
export type Toast = { id: number; type: "success" | "error" | "info"; title: string; text?: string };
let toastId = 0;
const toastListeners = new Set<(t: Toast) => void>();
export const notify = (t: Omit<Toast, "id">) => {
  toastListeners.forEach((l) => l({ ...t, id: ++toastId }));
};

const MAX_TOASTS = 3;
const DEDUPE_MS = 1500;

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const recent = new Map<string, number>();
    const onAdd = (t: Toast) => {
      const key = `${t.type}|${t.title}|${t.text ?? ""}`;
      const now = Date.now();
      const last = recent.get(key) ?? 0;
      if (now - last < DEDUPE_MS) return;
      recent.set(key, now);
      setItems((p) => {
        const next = [...p, t];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });
      setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 4000);
    };
    toastListeners.add(onAdd);
    return () => {
      toastListeners.delete(onAdd);
    };
  }, []);
  const dismiss = (id: number) => setItems((p) => p.filter((x) => x.id !== id));

  const meta = (type: Toast["type"]) => {
    if (type === "success") return { icon: "solar:check-circle-bold-duotone", color: "#5D9EFF" };
    if (type === "error") return { icon: "solar:close-circle-bold-duotone", color: "#ff4d61" };
    return { icon: "solar:info-circle-bold-duotone", color: "#2079FF" };
  };

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-32px)]">
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const m = meta(t.type);
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 380, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 380, scale: 0.96, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
              className="relative pl-3 pr-9 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_12px_30px_-10px_rgba(0,0,0,.12)] flex gap-3"
            >
              <div className="pt-0.5">
                <Icon name={m.icon} size={20} color={m.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[var(--fg)]">{t.title}</div>
                {t.text ? (
                  <div className="text-[12px] text-[var(--muted)] mt-0.5 leading-snug">{t.text}</div>
                ) : null}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface)] transition-colors"
                aria-label="Закрыть"
              >
                <Icon name="solar:close-circle-bold-duotone" size={14} color="#9A9A9A" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ============ Header ============ */
function MenuItem({
  icon,
  label,
  to,
  onClick,
  danger,
  badge,
}: {
  icon: string;
  label: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  badge?: number;
}) {
  const cls = `w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
    danger ? "text-[#e5484d] hover:bg-[#fdecec]" : "text-[var(--fg)] hover:bg-[var(--surface)]"
  }`;
  const inner = (
    <>
      <Icon name={icon} size={18} color={danger ? "#e5484d" : "#9A9A9A"} />
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full accent-bg text-white text-[10px] font-semibold">
          {badge}
        </span>
      ) : null}
    </>
  );
  if (to) {
    return (
      <Link to={to} onClick={onClick} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

const LANGS = [
  { code: "RU", label: "Русский", cc: "ru" },
  { code: "EN", label: "English", cc: "gb" },
  { code: "UA", label: "Українська", cc: "ua" },
  { code: "KZ", label: "Қазақша", cc: "kz" },
];

function Flag({ cc, size = 22 }: { cc: string; size?: number }) {
  return (
    <img
      src={`https://hatscripts.github.io/circle-flags/flags/${cc}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="rounded-full shrink-0 block"
      style={{ width: size, height: size }}
    />
  );
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Сменить тему"
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--icon)] transition-colors overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon
            name={isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"}
            size={17}
            color={isDark ? "#FFD66E" : "#2079FF"}
          />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANGS[0]);




  useEffect(() => {
    if (!menuOpen && !langOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-user-menu]")) setMenuOpen(false);
      if (!t.closest("[data-lang-menu]")) setLangOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, langOpen]);

  return (
    <header className="w-full mb-6 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="gs-container h-[60px] flex items-center">
        <Link to="/" className="flex items-center gap-2 mr-10">
          <span className="w-2 h-2 rounded-full accent-bg" />
          <span className="text-[15px] font-semibold tracking-[0.18em] text-[var(--fg)]">
            PUBLIC RUST
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="flex items-center gap-1.5 px-3 py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            activeProps={{ className: "flex items-center gap-1.5 px-3 py-2 text-[var(--fg)] font-medium" }}
          >
            <Icon name="solar:bag-4-bold-duotone" size={16} color="#2079FF" />
            Магазин
          </Link>
          <div className="relative group">
            <Link
              to="/wipes"
              className="flex items-center gap-1.5 px-3 py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
              activeProps={{ className: "flex items-center gap-1.5 px-3 py-2 text-[var(--fg)] font-medium" }}
            >
              <Icon name="solar:calendar-bold-duotone" size={16} color="#22c55e" />
              Вайпы
              <Icon name="solar:alt-arrow-down-bold-duotone" size={11} color="#9A9A9A" className="opacity-70 group-hover:opacity-100" />
            </Link>
            <div className="absolute left-0 top-full pt-2 z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150">
              <div className="w-56 rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_20px_50px_-15px_rgba(0,0,0,.18)] p-1.5">
                <Link
                  to="/wipes"
                  search={{ view: "schedule" }}
                  className="flex items-center gap-2.5 px-2.5 h-10 rounded-lg text-[13px] text-[var(--fg)] hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[#22c55e]/15 flex items-center justify-center">
                    <Icon name="solar:calendar-bold-duotone" size={14} color="#22c55e" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-tight">Расписание вайпов</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">Календарь по месяцам</div>
                  </div>
                </Link>
                <Link
                  to="/wipes"
                  search={{ view: "block" }}
                  className="flex items-center gap-2.5 px-2.5 h-10 rounded-lg text-[13px] text-[var(--fg)] hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[#f59e0b]/15 flex items-center justify-center">
                    <Icon name="solar:lock-keyhole-bold-duotone" size={14} color="#f59e0b" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-tight">Вайп блок</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">Тайм-слоты предметов</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <Link
            to="/rules"
            className="flex items-center gap-1.5 px-3 py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            activeProps={{ className: "flex items-center gap-1.5 px-3 py-2 text-[var(--fg)] font-medium" }}
          >
            <Icon name="solar:shield-check-bold-duotone" size={16} color="#f59e0b" />
            Правила
          </Link>
          <a className="flex items-center gap-1.5 px-3 py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer">
            <Icon name="solar:chat-round-dots-bold-duotone" size={16} color="#ec4899" />
            Поддержка
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block" data-lang-menu>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 h-9 pl-1 pr-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--icon)] transition-colors text-[13px] font-medium text-[var(--fg)]"
              aria-label="Язык"
            >
              <Flag cc={lang.cc} size={26} />

              {lang.code}
              <Icon name="solar:alt-arrow-down-bold-duotone" size={12} color="#9A9A9A" />
            </button>
            <AnimatePresence>
              {langOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_20px_50px_-15px_rgba(0,0,0,.18)] p-1.5"
                >
                  {LANGS.map((l) => {
                    const active = l.code === lang.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-colors ${
                          active
                            ? "bg-[var(--surface)] text-[var(--fg)] font-medium"
                            : "text-[var(--fg)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        <Flag cc={l.cc} size={22} />

                        <span className="flex-1 text-left">{l.label}</span>
                        <span className="text-[11px] text-[var(--muted)] font-medium">{l.code}</span>
                        {active ? (
                          <Icon name="solar:check-circle-bold-duotone" size={14} color="#2079FF" />
                        ) : null}
                      </button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>




          <button
            onClick={() => notify({ type: "info", title: "Пополнение", text: "Открываем форму пополнения" })}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[13px] font-medium text-[var(--fg)] hover:border-[var(--accent-from)]/50 transition-colors"
          >
            <Icon name="solar:wallet-bold-duotone" size={16} color="#2079FF" />
            <span className="tabular-nums">{USER.balance.toFixed(2)}</span>
            <span className="text-[var(--muted)] text-[11px]">RUB</span>
          </button>

          <div className="relative" data-user-menu>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--icon)] transition-colors"
            >
              <span className="w-7 h-7 rounded-full accent-bg flex items-center justify-center text-white text-[12px] font-semibold">
                {USER.nick.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-[13px] font-medium text-[var(--fg)] hidden sm:inline">
                {USER.nick}
              </span>
              <Icon name="solar:alt-arrow-down-bold-duotone" size={14} color="#9A9A9A" />
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_20px_50px_-15px_rgba(0,0,0,.18)] p-1.5"
                >
                  <MenuItem
                    icon="solar:user-circle-bold-duotone"
                    label="Профиль"
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                  />


                  <MenuItem
                    icon="solar:history-bold-duotone"
                    label="История"
                    to="/history"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="my-1 h-px bg-[var(--border)]" />
                  <MenuItem
                    icon="solar:logout-3-bold-duotone"
                    label="Выход"
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      notify({ type: "success", title: "Вы вышли из аккаунта" });
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <ThemeToggle />


        </div>
      </div>
    </header>
  );
}

/* ============ Footer ============ */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="gs-container py-6 text-center text-[12px] leading-relaxed text-[var(--muted)]">
        <p className="mb-3">
          Размещенная на настоящем сайте информация носит исключительно информационный характер и
          ни при каких условиях не является публичной офертой.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <a className="hover:text-[var(--fg)] transition-colors cursor-pointer">
            Пользовательское соглашение
          </a>
          <a className="hover:text-[var(--fg)] transition-colors cursor-pointer">
            Политика конфиденциальности
          </a>
          <a className="hover:text-[var(--fg)] transition-colors cursor-pointer">help@gamestores.ru</a>
        </div>
        <p className="mt-4 text-[11px]">
          Сайт создан в системе <span className="accent-text font-semibold">GameStores</span>
        </p>
      </div>
    </footer>
  );
}

/* ============ Page shell ============ */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="gs-container flex-1 w-full">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

/* ============ Reusable section header ============ */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
        {subtitle ?? "Аккаунт"}
      </div>
      <h1 className="text-[28px] md:text-[32px] font-semibold text-[var(--fg)] tracking-tight">
        {title}
      </h1>
    </div>
  );
}
