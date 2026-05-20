type GeneratorFormProps = {
  topic: string;
  platform: string;
  style: string;
  isLoading: boolean;
  limitReached: boolean;
  user: unknown;
  onTopicChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
};

export function GeneratorForm({
  topic,
  platform,
  style,
  isLoading,
  limitReached,
  user,
  onTopicChange,
  onPlatformChange,
  onStyleChange,
  onGenerate,
}: GeneratorFormProps) {
  return (
    <div className="relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-white/5 p-5 shadow-2xl shadow-cyan-300/5 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.16),transparent_35%)]" />

      <div className="relative space-y-5">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            ✨ Генератор оформления
          </div>

          <h3 className="text-2xl font-black">
            Расскажите, что нужно упаковать
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Просто опишите тему видео или поста. Остальное — заголовок,
            описание, хештеги, CTA и первый комментарий — сервис подготовит сам.
          </p>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-300/10 text-lg">
              ✍️
            </span>
            Тема контента
          </label>

          <textarea
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            className="min-h-[170px] w-full resize-none rounded-3xl border border-cyan-300/30 bg-black/30 p-5 text-base font-medium leading-relaxed text-white outline-none transition placeholder:text-gray-500 hover:border-cyan-300/50 focus:border-cyan-300/80 focus:bg-black/40 focus:shadow-[0_0_0_4px_rgba(103,232,249,0.08)]"
            placeholder="Например: показываю, как посадить томаты в теплице и создать умные задачи для ухода..."
          />

          <p className="mt-3 text-sm text-gray-400">
            Чем конкретнее тема — тем точнее получится оформление.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-300">
              Площадка
            </span>

            <select
              value={platform}
              onChange={(event) => onPlatformChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-medium text-white outline-none transition hover:border-cyan-300/40 focus:border-cyan-300/70"
            >
              <option>VK Клипы</option>
              <option>Telegram</option>
              <option>YouTube Shorts</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-300">
              Стиль подачи
            </span>

            <select
              value={style}
              onChange={(event) => onStyleChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-medium text-white outline-none transition hover:border-violet-300/40 focus:border-violet-300/70"
            >
              <option>Дружелюбный</option>
              <option>Экспертный</option>
              <option>Дерзкий</option>
              <option>Продающий</option>
              <option>Музыкальный</option>
            </select>
          </label>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading || limitReached}
          className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-violet-300 to-cyan-300 px-7 py-5 font-black text-black shadow-lg shadow-cyan-300/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-cyan-300/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}

          <span className="relative z-10">
            {limitReached
              ? user
                ? "Лимит на сегодня закончился"
                : "Войдите, чтобы продолжить"
              : isLoading
              ? "Генерирую оформление..."
              : "Сгенерировать оформление"}
          </span>
        </button>
      </div>
    </div>
  );
}