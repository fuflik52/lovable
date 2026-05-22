import { createFileRoute } from "@tanstack/react-router";
import { Icon, Page, PageHeader } from "@/components/shop";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Правила — PUBLIC RUST" },
      { name: "description", content: "Правила игры на серверах PUBLIC RUST." },
    ],
  }),
  component: RulesPage,
});

type RuleSection = {
  icon: string;
  color: string;
  title: string;
  items: { ok: boolean; text: string }[];
};

const SECTIONS: RuleSection[] = [
  {
    icon: "solar:users-group-rounded-bold-duotone",
    color: "#2079FF",
    title: "Команды и альянсы",
    items: [
      { ok: true, text: "Максимальный размер команды — 5 человек." },
      { ok: false, text: "Запрещены союзы между разными командами." },
      { ok: false, text: "Запрещено передавать ресурсы союзникам через крафт-боксы." },
    ],
  },
  {
    icon: "solar:shield-warning-bold-duotone",
    color: "#ef4444",
    title: "Читы и эксплойты",
    items: [
      { ok: false, text: "Использование любых сторонних программ карается перманентным баном." },
      { ok: false, text: "Запрещена эксплуатация багов карты и объектов." },
      { ok: false, text: "Запрещён мульти-аккаунтинг на одном сервере." },
    ],
  },
  {
    icon: "solar:chat-square-like-bold-duotone",
    color: "#22c55e",
    title: "Общение в чате",
    items: [
      { ok: true, text: "Общение на любом языке разрешено." },
      { ok: false, text: "Запрещены оскорбления администрации и других игроков." },
      { ok: false, text: "Запрещена реклама сторонних проектов и Discord-серверов." },
    ],
  },
  {
    icon: "solar:home-2-bold-duotone",
    color: "#f59e0b",
    title: "Строительство",
    items: [
      { ok: false, text: "Запрещено блокировать монументы и важные точки карты." },
      { ok: false, text: "Запрещены гриферские башни выше 3 этажей около соседних баз." },
      { ok: true, text: "Двери разрешены в любом количестве в пределах базы." },
    ],
  },
];

function RulesPage() {
  return (
    <Page>
      <div className="max-w-[860px] mx-auto py-6">
        <PageHeader title="Правила сервера" subtitle="Документ" />

        <div className="rounded-2xl border border-[var(--border)] p-5 mb-6 flex items-start gap-4 bg-[var(--surface)]">
          <div className="w-11 h-11 rounded-xl accent-bg flex items-center justify-center shrink-0 shadow-[var(--accent-glow)]">
            <Icon name="solar:shield-check-bold" size={22} color="#ffffff" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[var(--fg)] mb-1">
              Соблюдение правил — обязательно
            </div>
            <div className="text-[12px] text-[var(--muted)] leading-relaxed">
              Все игроки сервера подтверждают согласие с правилами при первом подключении.
              Незнание правил не освобождает от ответственности.
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--icon)] transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}1a` }}
                >
                  <Icon name={s.icon} size={18} color={s.color} />
                </div>
                <div className="text-[14px] font-semibold text-[var(--fg)]">{s.title}</div>
              </div>

              <ul className="space-y-2.5">
                {s.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[12px] leading-snug">
                    <Icon
                      name={it.ok ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                      size={14}
                      color={it.ok ? "#22c55e" : "#ef4444"}
                    />
                    <span className="text-[var(--fg)]">{it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-5 flex items-center gap-3">
          <Icon name="solar:question-circle-bold-duotone" size={20} color="#9A9A9A" />
          <div className="text-[12px] text-[var(--muted)]">
            Есть вопрос по правилам? Напишите в{" "}
            <span className="text-[var(--fg)] font-medium">Поддержку</span> — администратор ответит в течение 10 минут.
          </div>
        </div>
      </div>
    </Page>
  );
}
