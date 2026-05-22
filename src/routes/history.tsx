import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedNumber, cart, Icon, notify, Page, PageHeader, TooltipIcon, useHistory } from "@/components/shop";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "История покупок — PUBLIC RUST" },
      { name: "description", content: "История заказов и покупок." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const orders = useHistory();
  const totalSpent = +orders.reduce((s, o) => s + o.price * o.qty, 0).toFixed(2);

  return (
    <Page>
      <div className="max-w-[860px] mx-auto py-6">
        <div className="flex items-end justify-between gap-4 mb-5">
          <PageHeader title="История покупок" subtitle="Аккаунт" />

          {/* Minimal inline stats */}
          <div className="flex items-center gap-3 text-[12px] text-[var(--muted)] shrink-0 pb-1">
            <span className="inline-flex items-center gap-1.5">
              <TooltipIcon icon="solar:clipboard-list-bold-duotone" tooltip="Заказов" color="#9A9A9A" size={14} />
              <AnimatedNumber value={orders.length} className="text-[13px] font-semibold text-[var(--fg)]" />
            </span>
            <span className="w-px h-3.5 bg-[var(--border)]" />
            <span className="inline-flex items-baseline gap-1 text-[var(--fg)]">
              <AnimatedNumber value={totalSpent.toFixed(2)} className="text-[13px] font-semibold" />
              <span className="text-[11px] text-[var(--muted)]">₽</span>
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <Icon name="solar:bag-cross-bold-duotone" size={24} color="#9A9A9A" />
            </div>
            <div className="text-[15px] font-medium text-[var(--fg)] mb-1">Покупок ещё нет</div>
            <p className="text-[13px] text-[var(--muted)] mb-5">
              Загляните в магазин и сделайте первую покупку.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full accent-bg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Перейти в магазин
              <Icon name="solar:arrow-right-linear" size={16} color="#ffffff" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                  className="rounded-2xl border border-[var(--border)] p-4 sm:p-5 hover:border-[var(--icon)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[var(--surface)] flex items-center justify-center shrink-0">
                      <img
                        src={o.img}
                        alt={o.name}
                        className="max-w-[60px] max-h-[60px] sm:max-w-[72px] sm:max-h-[72px] object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="text-[14px] sm:text-[15px] font-semibold text-[var(--fg)] truncate">
                            {o.name}
                            <span className="text-[var(--muted)] font-normal"> × {o.qty}</span>
                          </div>
                          <div className="text-[11px] text-[var(--muted)] mt-0.5">
                            Заказ #{o.id}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className="text-[15px] sm:text-[17px] font-semibold inline-flex items-baseline gap-1 tabular-nums"
                            style={{ color: "var(--accent-from)" }}
                          >
                            <AnimatedNumber value={(o.price * o.qty).toFixed(2)} />
                            <span className="text-[11px] text-[var(--muted)] font-medium">₽</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              cart.refund(o.id);
                              notify({
                                type: "success",
                                title: "Возврат оформлен",
                                text: `Заказ #${o.id} возвращён`,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[var(--border)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--icon)] hover:bg-[var(--surface)] transition-colors"
                          >
                            <Icon name="solar:undo-left-round-linear" size={12} color="currentColor" />
                            Вернуть
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <Field icon="solar:server-bold-duotone" label="Сервер" value={o.server} />
                        <Field icon="solar:calendar-bold-duotone" label="Дата" value={o.date} />
                        <Field icon="solar:clock-circle-bold-duotone" label="Время" value={o.time} />
                        <Field
                          icon="solar:check-circle-bold-duotone"
                          label="Статус"
                          value={o.status}
                          accent
                        />
                      </div>

                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Page>
  );
}

function Field({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon name={icon} size={14} color={accent ? "#2079FF" : "#9A9A9A"} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] leading-tight">
          {label}
        </div>
        <div
          className={`text-[12px] font-medium truncate leading-tight ${
            accent ? "" : "text-[var(--fg)]"
          }`}
          style={accent ? { color: "var(--accent-from)" } : undefined}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
