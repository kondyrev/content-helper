type HistoryItem = {
  id: string;
  topic: string;
  platform: string;
  style: string;
  result: string;
  created_at: string;
};

type HistorySectionProps = {
  history: HistoryItem[];
  onClear: () => void;
  onOpenItem: (item: HistoryItem) => void;
};

export function HistorySection({
  history,
  onClear,
  onOpenItem,
}: HistorySectionProps) {
  return (
    <section id="history" className="scroll-mt-8 mt-20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black">История</h2>

          <p className="mt-2 text-gray-400">
            Сохранённые генерации. Нажми на карточку, чтобы открыть результат.
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
          <p className="text-lg font-bold">История пока пустая</p>

          <p className="mt-2 text-gray-400">
            После первой генерации результат появится здесь.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onOpenItem(item)}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:border-violet-300/40 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                  {item.platform || "Площадка"}
                </span>

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  {item.style || "Стиль"}
                </span>
              </div>

              <h3 className="line-clamp-2 text-xl font-bold leading-snug">
                {item.topic}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                {item.result}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString("ru-RU")}
                </p>

                <span className="text-sm font-bold text-cyan-200 opacity-80 transition group-hover:opacity-100">
                  Открыть →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}