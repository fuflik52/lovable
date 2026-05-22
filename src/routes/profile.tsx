import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatedNumber, Icon, Page, PageHeader, USER, notify } from "@/components/shop";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — PUBLIC RUST" },
      { name: "description", content: "Личный профиль игрока, баланс и промокоды." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [promo, setPromo] = useState("");
  const [copied, setCopied] = useState(false);

  const copySteamId = async () => {
    try {
      await navigator.clipboard.writeText(USER.steamId);
      setCopied(true);
      notify({ type: "success", title: "SteamID скопирован" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify({ type: "error", title: "Не удалось скопировать" });
    }
  };

  return (
    <Page>
      <div className="max-w-[760px] mx-auto py-6">
        <PageHeader title="Профиль" subtitle="Аккаунт" />

        {/* Identity card */}
        <div className="rounded-2xl border border-[var(--border)] p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full accent-bg flex items-center justify-center text-white text-[20px] font-semibold shadow-[var(--accent-glow)]">
            {USER.nick.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold text-[var(--fg)]">{USER.nick}</div>
            <div className="text-[12px] text-[var(--muted)]">Игрок · PUBLIC RUST</div>
          </div>
          <button
            onClick={() => notify({ type: "info", title: "Пополнение", text: "Открываем форму пополнения" })}
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full accent-bg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-[var(--accent-glow)]"
          >
            <Icon name="solar:wallet-bold-duotone" size={16} color="#ffffff" />
            Пополнить
          </button>
        </div>

        {/* Info section */}
        <Section title="Информация">
          <div className="rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
            <Row
              icon="solar:gamepad-bold-duotone"
              label="SteamID"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--fg)] tabular-nums">
                    {USER.steamId}
                  </span>
                  <button
                    onClick={copySteamId}
                    aria-label="Копировать SteamID"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--surface)] transition-colors"
                  >
                    <Icon
                      name={
                        copied ? "solar:check-circle-bold-duotone" : "solar:copy-bold-duotone"
                      }
                      size={16}
                      color={copied ? "#2079FF" : "#9A9A9A"}
                    />
                  </button>
                </div>
              }
            />
            <Row
              icon="solar:wallet-bold-duotone"
              label="Баланс"
              value={
                <span className="text-[14px] font-semibold inline-flex items-baseline gap-1" style={{ color: "var(--accent-from)" }}>
                  <AnimatedNumber value={USER.balance.toFixed(2)} />
                  <span className="text-[11px] text-[var(--muted)] font-medium">RUB</span>
                </span>
              }
            />
          </div>
        </Section>

        {/* Promo section */}
        <Section title="Использование промокода">
          <div className="rounded-2xl border border-[var(--border)] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center shrink-0">
                <Icon name="solar:ticket-sale-bold-duotone" size={20} color="#2079FF" />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-[var(--fg)] mb-0.5">
                  Активация промокода
                </div>
                <div className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Введите код, чтобы получить бонус на баланс или скидку на покупку.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Введите промокод"
                className="flex-1 h-11 px-4 rounded-full border border-[var(--border)] bg-transparent text-[13px] text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent-from)] transition-colors"
              />
              <button
                onClick={() => {
                  if (!promo.trim()) {
                    notify({ type: "error", title: "Промокод", text: "Введите код" });
                    return;
                  }
                  notify({
                    type: "error",
                    title: "Промокод не найден",
                    text: `Код «${promo}» недействителен`,
                  });
                  setPromo("");
                }}
                className="h-11 px-5 rounded-full accent-bg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shadow-[var(--accent-glow)]"
              >
                Применить
              </button>
            </div>
          </div>
        </Section>
      </div>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2 px-1">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Icon name={icon} size={18} color="#9A9A9A" />
        <span className="text-[13px] text-[var(--muted)]">{label}</span>
      </div>
      <div>{value}</div>
    </div>
  );
}
