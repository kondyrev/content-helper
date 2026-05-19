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
    <div className="rounded-[36px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
      <div className="space-y-4">
        <textarea
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          className="min-h-[150px] w-full resize-none rounded-3xl border border-white/10 bg-black/20 p-5 outline-none"
          placeholder="Например: обзор нового трека, рецепт, дача, бизнес, экспертное видео..."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={platform}
            onChange={(event) => onPlatformChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <option>VK Клипы</option>
            <option>Telegram</option>
            <option>YouTube Shorts</option>
          </select>

          <select
            value={style}
            onChange={(event) => onStyleChange(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <option>Дружелюбный</option>
            <option>Экспертный</option>
            <option>Дерзкий</option>
            <option>Продающий</option>
            <option>Музыкальный</option>
          </select>
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