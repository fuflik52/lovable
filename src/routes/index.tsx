import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Copy, CheckCircle, Server, Ticket, CalendarDays, X } from "lucide-react";
import {
  AnimatedNumber,
  Icon,
  Page,
  SERVERS,
  cart,
  notify,
} from "@/components/shop";
import catResources from "@/assets/cat-resources.png";
import catAmmo from "@/assets/cat-ammo.png";
import catClothes from "@/assets/cat-clothes.png";
import catTools from "@/assets/cat-tools.png";
import catMeds from "@/assets/cat-meds.png";
import promoStart from "@/assets/promo-start.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PUBLIC RUST — Магазин" },
      {
        name: "description",
        content: "Магазин внутриигровых товаров проекта PUBLIC RUST по игре RUST.",
      },
    ],
  }),
  component: Index,
});

/* ============ Data ============ */
type Category =
  | "Все"
  | "Ресурсы"
  | "Боеприпасы"
  | "Одежда"
  | "Инструменты"
  | "Медикаменты";

const CATEGORIES: { name: Category; img?: string; icon?: string }[] = [
  { name: "Все", icon: "solar:widget-5-bold-duotone" },
  { name: "Ресурсы", img: catResources },
  { name: "Боеприпасы", img: catAmmo },
  { name: "Одежда", img: catClothes },
  { name: "Инструменты", img: catTools },
  { name: "Медикаменты", img: catMeds },
];

type KitItem = { name: string; img: string; qty: number };
type KitSection = { id: string; name: string; icon: string; items: KitItem[] };

type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  count?: number;
  category: Category;
  img: string;
  kind?: "kit";
  sections?: KitSection[];
  tag?: "hot" | "new";
  accent?: string;
};

const IMG_POOL = [
  "https://cdn.gamestores.app/img/games/gamestores.png",
  "https://cdn.gamestores.app/img/games/rust/1712070256.webp",
  "https://cdn.gamestores.app/img/games/rust/1992974553.webp",
  "https://cdn.gamestores.app/img/games/rust/blueprintbase.png",
  "https://cdn.gamestores.app/img/noimage.png",
];
const pick = (i: number) => IMG_POOL[i % IMG_POOL.length];

const KIT_ITEM_NAMES = [
  "Wood", "Stone", "Metal Frag", "Sulfur", "HQM", "Cloth",
  "Gear", "Spring", "Tech Trash", "Rope", "Sewing Kit", "Rifle Body",
  "AK-47", "M249", "L96", "Bolt Rifle", "MP5", "Thompson",
  "Hazmat Suit", "Metal Armor", "Road Sign", "Coffee Can",
  "5.56 Ammo", "HV 5.56", "Pistol Ammo", "Shotgun Shell",
  "Jackhammer", "Chainsaw", "Salvaged Axe", "Salvaged Pickaxe",
  "Medical Syringe", "Bandage", "Large Med Kit",
];
const sectionItems = (start: number, n: number, qtyMin: number, qtyMax: number): KitItem[] =>
  Array.from({ length: n }, (_, i) => ({
    name: KIT_ITEM_NAMES[(start + i) % KIT_ITEM_NAMES.length],
    img: pick(start + i),
    qty: Math.round(qtyMin + ((i * 97) % 100) / 99 * (qtyMax - qtyMin)),
  }));

const makeKit = (
  id: number,
  name: string,
  price: number,
  oldPrice: number,
  accent: string,
  tag?: "hot" | "new",
): Product => ({
  id,
  name,
  price,
  oldPrice,
  discount: Math.round((1 - price / oldPrice) * 100),
  category: "Ресурсы",
  img: pick(id),
  tag,
  kind: "kit",
  accent,
  sections: [
    { id: "res", name: "Ресурсы", icon: "solar:box-minimalistic-linear", items: sectionItems(0, 18, 500, 12000) },
    { id: "comp", name: "Компоненты", icon: "solar:cpu-bolt-linear", items: sectionItems(6, 14, 5, 80) },
    { id: "eq1", name: "Снаряжение #1", icon: "solar:shield-keyhole-linear", items: sectionItems(12, 22, 1, 400) },
    { id: "eq2", name: "Снаряжение #2", icon: "solar:shield-star-linear", items: sectionItems(15, 26, 1, 600) },
    { id: "tools", name: "Инструменты", icon: "solar:tuning-2-linear", items: sectionItems(26, 12, 1, 5) },
  ],
});

const KIT_VIP = makeKit(999, "VIP Набор «Старт»", 499, 690, "#2079FF", "new");
const KIT_PRO = makeKit(998, "PRO Набор «Лес»", 1299, 1990, "#85FF62", "hot");
const KIT_ELITE = makeKit(997, "ELITE Набор «Океан»", 2499, 3490, "#42FFD2");
const KIT_GOLD = makeKit(996, "GOLD Набор «Король»", 3990, 5990, "#FFE86E", "hot");

const PRODUCTS: Product[] = [
  KIT_VIP,
  KIT_PRO,
  KIT_ELITE,
  KIT_GOLD,
  { id: 1, name: "Суперсыворотка", price: 149, oldPrice: 299, discount: 50, count: 1, category: "Ресурсы", img: pick(0), tag: "hot" },
  { id: 2, name: "Чистый целебный чай", price: 89, count: 1, category: "Медикаменты", img: pick(1) },
  { id: 3, name: "Чистый древесный чай", price: 99, oldPrice: 129, discount: 23, count: 1, category: "Ресурсы", img: pick(2), tag: "new" },
  { id: 4, name: "Чистый рудный чай", price: 119, count: 1, category: "Ресурсы", img: pick(3) },
  { id: 5, name: "Чай на макс. здоровье", price: 159, oldPrice: 199, discount: 20, count: 1, category: "Медикаменты", img: pick(4), tag: "hot" },
  { id: 6, name: "5.56 Rifle Ammo", price: 160.05, oldPrice: 165, discount: 3, count: 11, category: "Боеприпасы", img: pick(0), tag: "hot" },
  { id: 7, name: "Hammer", price: 25, count: 5, category: "Инструменты", img: pick(1) },
  { id: 8, name: "Burlap Trousers", price: 49.9, oldPrice: 60, discount: 17, count: 3, category: "Одежда", img: pick(2), tag: "new" },
  { id: 9, name: "Medical Syringe", price: 8, count: 20, category: "Медикаменты", img: pick(3) },
  { id: 10, name: "Large Wood Box", price: 199, count: 1, category: "Инструменты", img: pick(4) },
  { id: 11, name: "Metal Fragments", price: 12.5, count: 50, category: "Ресурсы", img: pick(0), tag: "hot" },
  { id: 12, name: "Pistol Ammo", price: 320, oldPrice: 400, discount: 20, count: 2, category: "Боеприпасы", img: pick(1) },
  { id: 13, name: "Wood", price: 1, count: 12, category: "Ресурсы", img: pick(2) },
  { id: 14, name: "Sulfur", price: 4.5, count: 100, category: "Ресурсы", img: pick(3), tag: "new" },
  { id: 15, name: "HQM", price: 18, count: 10, category: "Ресурсы", img: pick(4) },
  { id: 16, name: "AK-47", price: 890, oldPrice: 990, discount: 10, count: 1, category: "Инструменты", img: pick(0), tag: "hot" },
  { id: 17, name: "Bolt Action Rifle", price: 650, count: 1, category: "Инструменты", img: pick(1) },
  { id: 18, name: "Hazmat Suit", price: 240, oldPrice: 290, discount: 17, count: 1, category: "Одежда", img: pick(2) },
  { id: 19, name: "Large Med Kit", price: 65, count: 5, category: "Медикаменты", img: pick(3), tag: "new" },
  { id: 20, name: "Sheet Metal Door", price: 220, count: 1, category: "Инструменты", img: pick(4) },
];

function Index() {
  const [active, setActive] = useState<Category>("Все");
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState<Product | null>(null);

  const items = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (active === "Все" || p.category === active) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [active, query],
  );

  return (
    <Page>
      <HeroBanner />

      <section className="mt-6 flex flex-col gap-5">
        <Search value={query} onChange={setQuery} />
        <Categories active={active} onSelect={setActive} />
        <ProductGrid items={items} onOpen={setOpened} resetKey={`${active}|${query}`} />
      </section>

      <InfoPanels />

      {opened?.kind === "kit" ? (
        <KitModal product={opened} onClose={() => setOpened(null)} />
      ) : (
        <ProductModal
          product={opened}
          items={items.filter((p) => p.kind !== "kit")}
          onChange={setOpened}
          onClose={() => setOpened(null)}
        />
      )}
    </Page>
  );
}

/* ============ Floating corner widget ============ */
const GAME_SERVERS = [
  { name: "KRISTALIX RUST NOLIMIT 50X", online: true, players: 26, max: 150, queue: 0 },
  { name: "KRISTALIX RUST MAX3 50X", online: false, players: 0, max: 150, queue: 0 },
];

type PanelTab = "servers" | "promo" | "calendar";

function InfoPanels() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("servers");

  const onlineCount = GAME_SERVERS.filter((s) => s.online).length;

  const tabs: { id: PanelTab; Icon: typeof Server; label: string }[] = [
    { id: "servers", Icon: Server, label: "Серверы" },
    { id: "promo", Icon: Ticket, label: "Промокод" },
    { id: "calendar", Icon: CalendarDays, label: "Вайпы" },
  ];

  const activeTab = tabs.find((t) => t.id === tab)!;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,.35)] overflow-hidden origin-bottom-right"
          >
            {/* Tab rail */}
            <div className="relative flex items-center gap-1 p-1.5 m-2 mb-0 rounded-xl bg-[var(--surface)]">
              {tabs.map((t) => {
                const isActive = tab === t.id;
                const TabIcon = t.Icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="relative flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors"
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="tabActive"
                        className="absolute inset-0 rounded-lg bg-[var(--bg)] shadow-[0_2px_8px_-2px_rgba(0,0,0,.12)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    ) : null}
                    <TabIcon
                      size={13}
                      className="relative z-10"
                      style={{ color: isActive ? "var(--accent-from)" : "var(--muted)" }}
                    />
                    <span
                      className="relative z-10"
                      style={{ color: isActive ? "var(--fg)" : "var(--muted)" }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="p-4 pt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {tab === "servers" ? <ServersBody /> : null}
                  {tab === "promo" ? <PromoBody /> : null}
                  {tab === "calendar" ? <CalendarBody /> : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Trigger pill */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть виджет серверов"
        initial={false}
        animate={{ width: open ? 44 : "auto" }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="relative h-11 rounded-full accent-bg text-white flex items-center gap-2.5 pl-1 pr-4 shadow-[0_16px_40px_-12px_rgba(32,121,255,.55)] overflow-hidden"
      >
        {/* Shimmer sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3.5s linear infinite",
          }}
        />
        <span className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : activeTab.id}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {(() => {
                const ActiveIcon = activeTab.Icon;
                return open ? (
                  <X size={18} color="#ffffff" />
                ) : (
                  <ActiveIcon size={18} color="#ffffff" />
                );
              })()}
            </motion.span>
          </AnimatePresence>
          {!open && onlineCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#22c55e] text-[9px] font-bold flex items-center justify-center border-2 border-[var(--bg)]">
              {onlineCount}
            </span>
          ) : null}
        </span>
        <AnimatePresence initial={false}>
          {!open ? (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="relative text-[12px] font-semibold tracking-wide whitespace-nowrap overflow-hidden flex items-center gap-1.5"
            >
              Серверы
              <span className="opacity-70 text-[10px] tabular-nums">
                {onlineCount}/{GAME_SERVERS.length} онлайн
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}


function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2 px-0.5">
      {children}
    </div>
  );
}

function ServersBody() {
  return (
    <div>
      <SectionLabel>Серверы</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {GAME_SERVERS.map((s) => (
          <button
            key={s.name}
            onClick={() =>
              notify({
                type: s.online ? "success" : "error",
                title: s.online ? "Подключение" : "Сервер недоступен",
                text: s.name,
              })
            }
            disabled={!s.online}
            className="group w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2.5 hover:bg-[var(--surface)] transition-colors disabled:opacity-60"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                s.online ? "bg-[#22c55e]" : "bg-[#9A9A9A]"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[var(--fg)] truncate">
                {s.name}
              </div>
              <div className="text-[10px] text-[var(--muted)] tabular-nums">
                {s.online ? `${s.players}/${s.max}` : "Оффлайн"}
              </div>
            </div>
            {s.online ? (
              <Icon
                name="solar:arrow-right-linear"
                size={12}
                color="#9A9A9A"
              />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function PromoBody() {
  const code = "START";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      notify({ type: "success", title: "Промокод скопирован", text: code });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify({ type: "error", title: "Не удалось скопировать" });
    }
  };

  return (
    <button
      onClick={copy}
      aria-label={`Скопировать промокод ${code}`}
      className="group w-full text-left focus:outline-none"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="shrink-0 w-9 h-9 rounded-md grid place-items-center accent-bg text-white shadow-[0_4px_12px_-4px_var(--accent-from)]">
          <Gift size={18} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[var(--fg)] leading-tight">
            Промокод
          </div>
          <div className="text-[10px] text-[var(--muted)] leading-tight">
            Активируй и получи бонус
          </div>
        </div>
      </div>

      <div
        className={`relative h-11 rounded-md border-2 border-dashed grid place-items-center transition-all duration-200 ${
          copied
            ? "border-[var(--accent-from)] bg-[var(--accent-from)]/10"
            : "border-[var(--accent-from)]/60 bg-[var(--surface)] group-hover:border-[var(--accent-from)] group-hover:bg-[var(--accent-from)]/5"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "ok" : code}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.16 }}
            className="text-[18px] font-extrabold tracking-[0.32em] text-[var(--accent-from)]"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }}
          >
            {copied ? "СКОПИРОВАНО" : code}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors">
        {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
        {copied ? "готово" : "Нажми чтобы скопировать"}
      </div>
    </button>
  );
}



function CalendarBody() {
  const now = new Date(2026, 4, 21);
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleString("ru-RU", { month: "long" });
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const wipeDays = [1, 8, 15, 22, 29];
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 px-0.5">
        <CalendarDays size={11} className="text-[var(--accent-from)]" />
        <span className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Вайпы · {monthName} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div key={d} className="text-[9px] text-[var(--muted)] py-0.5">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} className="aspect-square" />;
          const isToday = d === today;
          const isWipe = wipeDays.includes(d);
          return (
            <div
              key={d}
              className={`relative aspect-square flex items-center justify-center text-[10px] rounded-md tabular-nums border transition-colors ${
                isToday
                  ? "accent-bg text-white font-semibold border-transparent"
                  : isWipe
                  ? "text-[var(--fg)] font-medium border-[var(--accent-from)]/50"
                  : "text-[var(--muted)] border-[var(--border)] hover:border-[var(--icon)]"
              }`}
            >
              {d}
              {isWipe && !isToday ? (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[var(--accent-from)]" />
              ) : null}
            </div>
          );
        })}
      </div>

    </div>
  );
}


/* ============ Categories ============ */
function Categories({ active, onSelect }: { active: Category; onSelect: (c: Category) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORIES.map((c) => {
        const isActive = c.name === active;
        return (
          <button
            key={c.name}
            onClick={() => onSelect(c.name)}
            className={`group relative inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-[var(--surface)] text-[13px] font-medium transition-all duration-200 border ${
              isActive
                ? "border-[var(--accent-from)] shadow-[0_8px_24px_-12px_rgba(32,121,255,.45)]"
                : "border-[#ECECEC] hover:border-[var(--icon)] shadow-[0_2px_8px_-4px_rgba(0,0,0,.06)]"
            }`}
          >
            <span className="relative w-8 h-8 flex items-center justify-center shrink-0">
              {c.img ? (
                <img
                  src={c.img}
                  alt={c.name}
                  className="max-w-full max-h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,.18)]"
                  draggable={false}
                />
              ) : (
                <Icon name={c.icon!} size={20} color={isActive ? "#2079FF" : "#9A9A9A"} />
              )}
            </span>

            <span className="text-[var(--fg)]">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Search ============ */
function Search({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="w-full flex items-center h-11 rounded-full bg-transparent border border-[var(--border)] focus-within:border-[var(--accent-from)] transition-colors px-2">
      <div className="pl-3 pr-2">
        <Icon name="solar:magnifer-linear" size={18} color="#9A9A9A" />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск товара..."
        className="text-[14px] w-full h-full pr-3 text-[var(--fg)] placeholder:text-[var(--muted)]"
      />
    </div>
  );
}

/* ============ Product grid + card ============ */
function ProductGrid({
  items,
  onOpen,
  resetKey,
}: {
  items: Product[];
  onOpen: (p: Product) => void;
  resetKey: string;
}) {
  if (items.length === 0) {
    return (
      <div key={`empty-${resetKey}`} className="anim-fade w-full text-center my-14 text-[14px] text-[var(--muted)]">
        Товары не найдены
      </div>
    );
  }
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      const cs = getComputedStyle(el).gridTemplateColumns;
      const n = cs.split(" ").filter(Boolean).length;
      if (n > 0) setCols(n);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const ghosts = (cols - (items.length % cols)) % cols;
  return (
    <div
      key={resetKey}
      ref={gridRef}
      className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
    >
      {items.map((p, i) => (
        <ProductCard key={p.id} p={p} onOpen={onOpen} index={i} />
      ))}
      {Array.from({ length: ghosts }).map((_, i) => (
        <GhostCard key={`g-${i}`} />
      ))}
    </div>
  );
}

function GhostCard() {
  return (
    <div
      aria-hidden
      className="anim-fade rounded-2xl aspect-[1/1.18] bg-[repeating-linear-gradient(135deg,transparent_0_8px,var(--surface)_8px_9px)] border border-dashed border-[var(--border)] flex items-center justify-center"
    >
      <div className="opacity-40">
        <Icon name="solar:gallery-add-linear" size={22} color="#9A9A9A" />
      </div>
    </div>
  );
}

function ProductCard({ p, onOpen, index }: { p: Product; onOpen: (p: Product) => void; index: number }) {
  const isKit = p.kind === "kit";
  const accent = p.accent ?? "#2079FF";
  const accentFg = isKit ? fgFor(accent) : "#ffffff";
  return (
    <button
      onClick={() => onOpen(p)}
      className={`anim-pop group relative text-left rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 border ${
        isKit
          ? "hover:shadow-[0_18px_40px_-14px_rgba(0,0,0,.18)]"
          : "border-[var(--border)] bg-transparent hover:border-[var(--accent-from)]/60 hover:shadow-[0_12px_30px_-14px_rgba(32,121,255,.25)]"
      }`}
      style={
        isKit
          ? {
              animationDelay: `${Math.min(index * 40, 320)}ms`,
              borderColor: withAlpha(accent, 0.4),
              background: `linear-gradient(135deg, ${withAlpha(accent, 0.10)} 0%, ${withAlpha(accent, 0.02)} 60%, transparent 100%)`,
            }
          : { animationDelay: `${Math.min(index * 40, 320)}ms` }
      }
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-110"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
          }}
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          <div className="flex items-baseline gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)]/85 backdrop-blur-md border border-[var(--border)] shadow-sm">
            <span
              className="text-[12px] font-semibold tabular-nums"
              style={{ color: isKit ? accent : "var(--accent-from)" }}
            >
              {Number.isInteger(p.price) ? p.price : p.price.toFixed(2)} ₽
            </span>
            {p.oldPrice ? (
              <span className="text-[10px] text-[var(--muted)] line-through tabular-nums">{p.oldPrice}</span>
            ) : null}
          </div>
          {p.tag === "hot" ? <TagBadge kind="hot" /> : null}
          {p.tag === "new" ? <TagBadge kind="new" /> : null}
        </div>

        {isKit ? (
          <div
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
            style={{ background: accent, color: accentFg, boxShadow: `0 8px 20px -8px ${withAlpha(accent, 0.55)}` }}
          >
            <Icon name="solar:bag-4-bold-duotone" size={12} color={accentFg} />
            Набор
          </div>
        ) : p.discount ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold accent-bg text-white shadow-[var(--accent-glow)]">
            −{p.discount}%
          </div>
        ) : p.count ? (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg)]/85 backdrop-blur-md border border-[var(--border)] text-[var(--muted)]">
            ×{p.count}
          </div>
        ) : null}
      </div>

      <div className="px-4 pb-4 pt-1">
        <div className="text-[13px] text-[var(--fg)] font-medium truncate">{p.name}</div>
        {isKit && p.sections ? (
          <div className="mt-1 text-[11px] text-[var(--muted)]">
            {p.sections.reduce((s, x) => s + x.items.length, 0)} предметов · {p.sections.length} разделов
          </div>
        ) : null}
      </div>
    </button>
  );
}

/* ============ Tag badge ============ */
function TagBadge({ kind }: { kind: "hot" | "new" }) {
  if (kind === "hot") {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white"
        style={{
          background: "linear-gradient(135deg, #FF3131 0%, #FF612F 100%)",
          boxShadow: "0 6px 16px -6px rgba(255,49,49,.55)",
        }}
      >
        <Icon name="solar:fire-bold" size={11} color="#ffffff" />
        Hot
      </div>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white"
      style={{
        background: "linear-gradient(135deg, #21CAFF 0%, #3151F9 100%)",
        boxShadow: "0 6px 16px -6px rgba(33,202,255,.55)",
      }}
    >
      <Icon name="solar:stars-bold" size={11} color="#ffffff" />
      New
    </div>
  );
}

/* ============ Hero banner ============ */
const RUST_ITEMS = Array.from({ length: 32 }, (_, i) => i);

function HeroBanner() {
  const colA = RUST_ITEMS.slice(0, 8);
  const colB = RUST_ITEMS.slice(8, 16);
  const colC = RUST_ITEMS.slice(16, 24);
  const colD = RUST_ITEMS.slice(24, 32);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-[var(--bg)] border border-[var(--border)]">
      <div className="flex flex-col-reverse md:flex-row min-h-[160px]">
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-center z-10 relative">
          <h1 className="text-[16px] md:text-[18px] font-semibold text-[var(--fg)] leading-tight mb-1.5 tracking-tight">
            Магазин предметов <span className="accent-text">и услуг</span>
          </h1>
          <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-[460px] mb-2.5">
            Здесь можно приобрести внутриигровые предметы и услуги. При пополнении счёта от
            определённой суммы начисляется бонус до 45% от депозита.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                notify({ type: "success", title: "Пополнение", text: "Открываем форму пополнения баланса" })
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md accent-bg text-white text-[11px] font-medium hover:opacity-90 transition-opacity shadow-[var(--accent-glow)]"
            >
              <Icon name="solar:wallet-bold-duotone" size={12} color="#ffffff" />
              Пополнить
            </button>
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] text-[11px] font-medium hover:border-[var(--icon)] transition-colors">
              <Icon name="solar:gift-bold-duotone" size={12} color="#9A9A9A" />
              Подробнее о бонусах
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-[50%] h-[180px] md:h-auto md:min-h-[220px] overflow-hidden">
          <div
            className="absolute -inset-[20%] flex gap-3 p-3"
            style={{ transform: "rotate(22deg)", transformOrigin: "center" }}
          >
            <MarqueeColumn items={colA} direction="up" duration={28} offset={0} />
            <MarqueeColumn items={colB} direction="down" duration={34} offset={1} />
            <MarqueeColumn items={colC} direction="up" duration={30} offset={2} />
            <MarqueeColumn items={colD} direction="down" duration={36} offset={3} className="hidden sm:block" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--bg),transparent_25%,transparent_75%,transparent)] md:bg-[linear-gradient(to_right,var(--bg),transparent_15%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[var(--bg)] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        </div>
      </div>
    </div>
  );
}

function MarqueeColumn({
  items,
  direction,
  duration,
  offset = 0,
  className = "",
}: {
  items: number[];
  direction: "up" | "down";
  duration: number;
  offset?: number;
  className?: string;
}) {
  const loop = [...items, ...items];
  return (
    <div className={`flex-1 min-w-0 overflow-hidden ${className}`}>
      <div
        className="flex flex-col gap-3"
        style={{
          animation: `${direction === "up" ? "marqueeUp" : "marqueeDown"} ${duration}s linear infinite`,
        }}
      >
        {loop.map((_, i) => (
          <ItemFrame key={i} src={pick(i + offset)} idx={i + offset} />
        ))}
      </div>
    </div>
  );
}

function ItemFrame({ src, idx = 0 }: { src: string; idx?: number }) {
  const hues = [210, 14, 280, 160, 38, 330];
  const hue = hues[idx % hues.length];
  return (
    <div
      className="relative aspect-square w-full rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 20%, hsl(${hue} 80% 60% / 0.18), hsl(${hue} 60% 30% / 0.06) 60%, transparent 100%), var(--surface)`,
        border: `1px solid hsl(${hue} 60% 55% / 0.35)`,
        boxShadow: `0 6px 18px -8px hsl(${hue} 70% 45% / 0.35), inset 0 0 0 1px rgba(255,255,255,.04)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 70% 60% / 0.12) 0%, transparent 50%, hsl(${hue} 80% 50% / 0.08) 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-30"
        style={{
          background: `conic-gradient(from ${idx * 45}deg, transparent 0deg, hsl(${hue} 80% 70% / 0.15) 60deg, transparent 120deg)`,
        }}
      />
      <img
        src={src}
        alt=""
        className="relative w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(180deg, hsl(${hue} 80% 70% / 0.12) 0%, transparent 30%)`,
        }}
      />
    </div>
  );
}

/* ============ Product Modal (carousel) ============ */

  

function ProductModal({
  product,
  items,
  onChange,
  onClose,
}: {
  product: Product | null;
  items: Product[];
  onChange: (p: Product) => void;
  onClose: () => void;
}) {
  const [count, setCount] = useState(1);
  const [dir, setDir] = useState(0); // -1 prev, +1 next
  const open = !!product;

  useEffect(() => {
    setCount(1);
  }, [product?.id]);

  const index = product ? items.findIndex((p) => p.id === product.id) : -1;
  const at = (offset: number): Product | null => {
    if (!items.length || index < 0) return null;
    const ni = ((index + offset) % items.length + items.length) % items.length;
    if (ni === index) return null;
    return items[ni];
  };
  const prev2 = at(-2);
  const prev1 = at(-1);
  const next1 = at(1);
  const next2 = at(2);

  const go = (delta: number) => {
    if (!items.length || index < 0) return;
    const ni = (index + delta + items.length) % items.length;
    setDir(delta);
    onChange(items[ni]);
  };

  const jumpTo = (target: Product, delta: number) => {
    setDir(delta);
    onChange(target);
  };

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    let wheelLock = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - wheelLock < 450) return;
      const d = e.deltaY || e.deltaX;
      if (Math.abs(d) < 12) return;
      wheelLock = now;
      go(d > 0 ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, index, items.length]);


  const unit = product?.price ?? 0;
  const total = +(unit * count).toFixed(2);

  const SidePreview = ({
    p,
    delta,
  }: {
    p: Product | null;
    delta: -2 | -1 | 1 | 2;
  }) => {
    if (!p) return null;
    const isFar = Math.abs(delta) === 2;
    // smaller, lower, faded, blurred side cards so the center towers above
    const translateX =
      delta === -2 ? "-340px" :
      delta === -1 ? "-190px" :
      delta === 1  ? "190px"  :
                     "340px";
    const translateY = isFar ? "40px" : "20px";
    const scale = isFar ? 0.78 : 0.9;
    const opacity = isFar ? 0.18 : 0.45;
    const blur = isFar ? "blur(6px)" : "blur(2px)";

    const z = isFar ? 1 : 5;
    const visibility = isFar ? "hidden xl:flex" : "hidden md:flex";

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          jumpTo(p, delta);
        }}
        aria-label={p.name}
        style={{
          transform: `translate(calc(-50% + ${translateX}), calc(-50% + ${translateY})) scale(${scale})`,
          transformOrigin: "center",
          opacity,
          filter: blur,
          zIndex: z,
        }}
        className={`absolute left-1/2 top-1/2 ${visibility} flex-col w-[390px] h-[560px] rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_40px_100px_-20px_rgba(0,0,0,.7)] p-8 cursor-pointer hover:opacity-80 transition-all duration-150 ease-out overflow-hidden pointer-events-auto`}
      >
        {p.discount ? (
          <span className="absolute top-4 left-4 z-10 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500 text-white">
            -{p.discount}%
          </span>
        ) : null}
        <span className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)]">
          <Icon name="solar:close-circle-linear" size={18} color="#9A9A9A" />
        </span>
        <div className="flex items-center justify-center h-[240px] mb-6 w-full">
          <img
            src={p.img}
            alt=""
            className="max-w-[200px] max-h-full object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
          />
        </div>
        <div className="text-center mb-5 w-full">
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
            {p.category}
          </div>
          <h3 className="text-[22px] font-semibold text-[var(--fg)] leading-tight tracking-tight truncate">
            {p.name}
          </h3>
        </div>
      </button>
    );
  };


  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[240] bg-black/60 backdrop-blur-md transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-30 flex justify-center pt-6 pointer-events-none">
          <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white/85 text-[12px] font-medium shadow-[0_8px_24px_-8px_rgba(0,0,0,.5)]">
            <Icon name="solar:mouse-linear" size={14} color="#ffffff" />
            Листайте колесом или свайпайте пальцем для выбора варианта
          </div>
        </div>
        <div className="relative min-h-full flex items-center justify-center p-4 py-12">

          {/* Stage holds side previews absolutely positioned around center */}
          <div className="relative w-[390px] h-[560px] max-w-[92vw]">
            <SidePreview p={prev2} delta={-2} />
            <SidePreview p={prev1} delta={-1} />
            <SidePreview p={next1} delta={1} />
            <SidePreview p={next2} delta={2} />

            {/* Center card */}
            <div className="absolute inset-0 z-20">
              <AnimatePresence mode="wait" custom={dir}>
                {product ? (
                  <motion.div
                    key={product.id}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 30, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: dir * -30, scale: 0.97 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}

                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_40px_100px_-20px_rgba(0,0,0,.7)] p-8"
                  >

                  {product.discount ? (
                    <span className="absolute top-4 left-4 z-10 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500 text-white">
                      -{product.discount}%
                    </span>
                  ) : null}
                  <button
                    onClick={onClose}
                    aria-label="Закрыть"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <Icon name="solar:close-circle-linear" size={18} color="#9A9A9A" />
                  </button>

                  <div className="flex items-center justify-center h-[240px] mb-6">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="max-w-[220px] max-h-full object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                  </div>


                  <div className="text-center mb-5">
                    <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      {product.category}
                    </div>
                    <h2 className="text-[22px] font-semibold text-[var(--fg)] leading-tight tracking-tight">
                      {product.name}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                    <span className="text-[13px] text-[var(--muted)]">Количество</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCount((c) => Math.max(1, c - 1))}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors"
                        aria-label="−"
                      >
                        <Icon name="solar:minus-circle-linear" size={20} color="#9A9A9A" />
                      </button>
                      <AnimatedNumber
                        value={count}
                        className="min-w-[24px] justify-center text-[15px] font-medium text-[var(--fg)]"
                      />
                      <button
                        onClick={() => setCount((c) => c + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors"
                        aria-label="+"
                      >
                        <Icon name="solar:add-circle-linear" size={20} color="#9A9A9A" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-[var(--border)] mb-5">
                    <span className="text-[13px] text-[var(--muted)]">К оплате</span>
                    <span
                      className="text-[20px] font-semibold inline-flex items-baseline gap-1"
                      style={{ color: "var(--accent-from)" }}
                    >
                      <AnimatedNumber value={total} />
                      <span>₽</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      cart.add({
                        id: product.id,
                        name: product.name,
                        img: product.img,
                        price: product.price,
                        qty: count,
                        server: "Любой",
                      });
                      notify({
                        type: "success",
                        title: "Покупка совершена",
                        text: `${product.name} ×${count} · введите /store в чате`,
                      });
                      onClose();
                    }}
                    className="w-full h-12 rounded-full accent-bg text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[var(--accent-glow)]"
                  >
                    Купить
                    <Icon name="solar:bag-check-bold-duotone" size={18} color="#ffffff" />
                  </button>

                  {/* Pagination dots */}
                  {items.length > 1 && index >= 0 ? (
                    <div className="mt-4 flex items-center justify-center gap-1.5">
                      {items.slice(0, Math.min(items.length, 9)).map((_, i) => {
                        const total = Math.min(items.length, 9);
                        const active =
                          items.length <= 9
                            ? i === index
                            : i === Math.round((index / (items.length - 1)) * (total - 1));
                        return (
                          <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              active ? "w-5 bg-[var(--accent-from)]" : "w-1.5 bg-[var(--border)]"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  <p className="mt-3 text-center text-[11px] text-[var(--muted)] leading-relaxed">
                    {index + 1} из {items.length}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============ Kit Modal ============ */
// Pick readable text color for a given accent background
function fgFor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? "#111111" : "#ffffff";
}

function withAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function KitModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const open = !!product;
  const [tab, setTab] = useState(0);
  const [count, setCount] = useState(1);
  const [server, setServer] = useState("Любой");

  useEffect(() => {
    setTab(0);
    setCount(1);
    setServer("Любой");
  }, [product?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sections = product?.sections ?? [];
  const active = sections[tab];
  const total = +((product?.price ?? 0) * count).toFixed(2);
  const accent = product?.accent ?? "#2079FF";
  const accentFg = fgFor(accent);
  const accentBg = { background: accent, color: accentFg };
  const accentShadow = { boxShadow: `0 10px 26px -10px ${withAlpha(accent, 0.55)}` };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[240] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div className="h-full overflow-y-auto scroll-thin">
        <div className="min-h-full flex items-center justify-center p-4">
          {product ? (
            <div
              key={product.id}
              onClick={(e) => e.stopPropagation()}
              className="anim-scale relative w-[640px] max-w-full rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_30px_80px_-20px_rgba(0,0,0,.18)] overflow-hidden"
              style={{ borderColor: withAlpha(accent, 0.25) }}
            >
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] transition-colors"
              >
                <Icon name="solar:close-circle-linear" size={18} color="#9A9A9A" />
              </button>

              {/* Hero: kit photo */}
              <div
                className="relative px-6 pt-7 pb-5 border-b border-[var(--border)]"
                style={{
                  background: `linear-gradient(135deg, ${withAlpha(accent, 0.18)} 0%, ${withAlpha(accent, 0.04)} 60%, transparent 100%)`,
                }}
              >
                <div className="flex items-center gap-5">
                  <div
                    className="relative shrink-0 w-[120px] h-[120px] rounded-2xl bg-[var(--bg)] border flex items-center justify-center overflow-hidden"
                    style={{ borderColor: withAlpha(accent, 0.35) }}
                  >
                    <img src={product.img} alt={product.name} className="w-full h-full object-contain p-3" />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${withAlpha(accent, 0.18)}, transparent)` }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-2"
                      style={accentBg}
                    >
                      <Icon name="solar:bag-4-bold-duotone" size={11} color={accentFg} />
                      Привилегия
                    </div>
                    <h2 className="text-[22px] font-semibold text-[var(--fg)] leading-tight tracking-tight">
                      {product.name}
                    </h2>
                    <div className="mt-1.5 text-[12px] text-[var(--muted)]">
                      {sections.reduce((s, x) => s + x.items.length, 0)} предметов в {sections.length} разделах
                    </div>
                  </div>
                </div>
              </div>

              {/* Section tabs */}
              <div className="px-6 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {sections.map((s, i) => {
                    const isActive = i === tab;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setTab(i)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 border ${
                          isActive
                            ? "border-transparent"
                            : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:text-[var(--fg)] hover:border-[var(--icon)]"
                        }`}
                        style={isActive ? { ...accentBg, ...accentShadow } : undefined}
                      >
                        <Icon name={s.icon} size={13} color={isActive ? accentFg : "#9A9A9A"} />
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Items grid — scrollable */}
              <div className="px-6 py-4">
                <div className="max-h-[300px] overflow-y-auto scroll-thin pr-1 -mr-1">
                  <KitItemsGrid key={active?.id} items={active?.items ?? []} accent={accent} />
                </div>
              </div>

              {/* Footer: server / qty / price / buy */}
              <div className="px-6 pt-3 pb-5 border-t border-[var(--border)] bg-[var(--surface-2)]">
                <div className="flex flex-wrap items-center gap-3">
                  <ServerDropdown value={server} onChange={setServer} />

                  <div className="inline-flex items-center gap-1 h-9 px-1 rounded-full bg-[var(--bg)] border border-[var(--border)]">
                    <button
                      onClick={() => setCount((c) => Math.max(1, c - 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors"
                      aria-label="−"
                    >
                      <Icon name="solar:minus-circle-linear" size={16} color="#9A9A9A" />
                    </button>
                    <AnimatedNumber
                      value={count}
                      className="min-w-[18px] justify-center text-[13px] font-semibold text-[var(--fg)]"
                    />
                    <button
                      onClick={() => setCount((c) => c + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)] transition-colors"
                      aria-label="+"
                    >
                      <Icon name="solar:add-circle-linear" size={16} color="#9A9A9A" />
                    </button>
                  </div>

                  <div
                    className="ml-auto inline-flex items-baseline gap-1 text-[18px] font-semibold"
                    style={{ color: accent }}
                  >
                    <AnimatedNumber value={total} />
                    <span className="text-[13px]">₽</span>
                  </div>

                  <button
                    onClick={() => {
                      cart.add({
                        id: product.id,
                        name: product.name,
                        img: product.img,
                        price: product.price,
                        qty: count,
                        server,
                      });
                      notify({
                        type: "success",
                        title: "Покупка совершена",
                        text: `${product.name} ×${count} · ${server}`,
                      });
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold hover:opacity-90 transition-opacity"
                    style={{ ...accentBg, ...accentShadow }}
                  >
                    <Icon name="solar:bag-check-bold-duotone" size={15} color={accentFg} />
                    Купить
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============ Custom server dropdown ============ */
function ServerDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 h-9 pl-2.5 pr-2.5 rounded-full bg-[var(--bg)] border transition-colors text-[12px] font-medium text-[var(--fg)] ${
          open ? "border-[var(--accent-from)]" : "border-[var(--border)] hover:border-[var(--icon)]"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-from)" }} />
        <Icon name="solar:server-square-linear" size={14} color="#9A9A9A" />
        <span className="max-w-[180px] truncate">{value}</span>
        <Icon
          name="solar:alt-arrow-down-bold-duotone"
          size={12}
          color="#9A9A9A"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-[260px] rounded-xl bg-[var(--bg)] border border-[var(--border)] shadow-[0_20px_50px_-15px_rgba(0,0,0,.22)] p-1.5"
          >
            <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
              Сервер выдачи
            </div>
            {SERVERS.map((s) => {
              const active = s === value;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                    active
                      ? "bg-[var(--surface)] text-[var(--fg)] font-medium"
                      : "text-[var(--fg)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: active ? "var(--accent-from)" : "var(--border)",
                    }}
                  />
                  <Icon name="solar:server-square-linear" size={14} color={active ? "#2079FF" : "#9A9A9A"} />
                  <span className="flex-1 text-left truncate">{s}</span>
                  {active ? <Icon name="solar:check-circle-bold-duotone" size={14} color="#2079FF" /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ============ Kit items grid with ghost fill ============ */
function KitItemsGrid({ items, accent = "#2079FF" }: { items: KitItem[]; accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(6);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const cs = getComputedStyle(el).gridTemplateColumns;
      const n = cs.split(" ").filter(Boolean).length;
      if (n > 0) setCols(n);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const ghosts = items.length === 0 ? 0 : (cols - (items.length % cols)) % cols;

  return (
    <div
      ref={ref}
      className="anim-fade grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(90px,1fr))]"
      style={{ ["--kit-accent" as string]: accent }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className="relative aspect-square rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden transition-colors hover:border-[var(--kit-accent)]"
        >
          <img src={it.img} alt="" className="w-full h-full object-contain p-2.5" />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums bg-[var(--bg)]/90 backdrop-blur border border-[var(--border)] text-[var(--fg)]">
            ×{it.qty}
          </div>
        </div>
      ))}
      {Array.from({ length: ghosts }).map((_, i) => (
        <div
          key={`g-${i}`}
          aria-hidden
          className="aspect-square rounded-xl border border-dashed border-[var(--border)] bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--surface)_6px_7px)]"
        />
      ))}
    </div>
  );
}
