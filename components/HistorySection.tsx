type HistoryItem = {
  id: string;
  topic: string;
  platform: string;
  style: string;
  created_at: string;
};

type HistorySectionProps = {
  history: HistoryItem[];
  onClear: () => void;
};

export function HistorySection({
  history,
  onClear,
}: HistorySectionProps) {
  return (
    <section
      id="history"
      className="scroll-mt-8 mt-20"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black">
            История
          </h2>

          <p className="mt-2 text-gray-400">
            Последние 10 генераций сохраняются в браузере.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/20"
          >
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
          <p className="text-lg font-bold">
            История пока пустая
          </p>

          <p className="mt-2 text-gray-400">
            Сгенерируй первое оформление 😄
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-violet-300/30"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                  {item.platform}
                </span>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  {item.style}
                </span>
              </div>

              <h3 className="text-xl font-bold leading-snug">
                {item.topic}
              </h3>

              <p className="mt-4 text-sm text-gray-400">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}