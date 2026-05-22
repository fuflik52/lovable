import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/download')({
  head: () => ({
    meta: [
      { title: "Скачать — Магазин" },
      { name: "description", content: "Скачать статическую версию сайта" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--fg)]">
          Скачать статический сайт
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-[var(--muted)]">
          HTML + CSS + JS версия магазина со всеми разделами, анимациями,
          иконками и изображениями. Работает без сборки и фреймворков.
        </p>
        <a
          href="/api/download/static-site"
          download="static-site.zip"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--accent-glow)] transition-transform hover:scale-105 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Скачать ZIP
        </a>
        <p className="mt-6 text-xs text-[var(--muted)]">
          Размер ~400 КБ
        </p>
      </div>
    </div>
  );
}
