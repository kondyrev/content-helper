import { useMemo, useState } from "react";

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
  onDeleteItems?: (ids: string[]) => void | Promise<void>;
};

const ITEMS_PER_PAGE = 6;

type SortMode = "newest" | "oldest";

function formatHistoryDate(date: string) {
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getShareText(item: HistoryItem) {
  return `${item.topic}

${item.result}`;
}

export function HistorySection({
  history,
  onClear,
  onOpenItem,
  onDeleteItems,
}: HistorySectionProps) {
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const platforms = useMemo(() => {
    return Array.from(
      new Set(history.map((item) => item.platform).filter(Boolean))
    );
  }, [history]);

  const styles = useMemo(() => {
    return Array.from(new Set(history.map((item) => item.style).filter(Boolean)));
  }, [history]);

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history
      .filter((item) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          item.topic.toLowerCase().includes(normalizedQuery) ||
          item.result.toLowerCase().includes(normalizedQuery) ||
          item.platform.toLowerCase().includes(normalizedQuery) ||
          item.style.toLowerCase().includes(normalizedQuery);

        const matchesPlatform =
          platformFilter === "all" || item.platform === platformFilter;

        const matchesStyle = styleFilter === "all" || item.style === styleFilter;

        return matchesQuery && matchesPlatform && matchesStyle;
      })
      .sort((a, b) => {
        const first = new Date(a.created_at).getTime();
        const second = new Date(b.created_at).getTime();

        return sortMode === "newest" ? second - first : first - second;
      });
  }, [history, platformFilter, query, sortMode, styleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredHistory]);

  const selectedOnPage = paginatedHistory.filter((item) =>
    selectedIds.includes(item.id)
  );

  const isAllPageSelected =
    paginatedHistory.length > 0 && selectedOnPage.length === paginatedHistory.length;

  function resetFilters() {
    setQuery("");
    setPlatformFilter("all");
    setStyleFilter("all");
    setSortMode("newest");
    setCurrentPage(1);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  }

  function toggleSelectPage() {
    if (isAllPageSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !paginatedHistory.some((item) => item.id === id))
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...paginatedHistory.map((item) => item.id)]))
    );
  }

  async function handleCopy(item: HistoryItem) {
    await navigator.clipboard.writeText(getShareText(item));
    setCopiedId(item.id);

    window.setTimeout(() => {
      setCopiedId(null);
    }, 1600);
  }

  async function handleShare(item: HistoryItem) {
    const shareData = {
      title: item.topic,
      text: getShareText(item),
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await handleCopy(item);
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0 || !onDeleteItems) return;

    await onDeleteItems(selectedIds);
    setSelectedIds([]);
  }

  async function handleDeleteOne(id: string) {
    if (!onDeleteItems) return;

    await onDeleteItems([id]);
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  }

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <section id="history" className="scroll-mt-8 mt-20">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-black tracking-tight">История</h2>

            {history.length > 0 && (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                {history.length} записей
              </span>
            )}
          </div>

          <p className="mt-3 max-w-2xl text-gray-400">
            Сохранённые генерации. Ищи, фильтруй, открывай, копируй, делись
            или удаляй лишнее.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {selectedIds.length > 0 && onDeleteItems && (
              <button
                onClick={handleDeleteSelected}
                className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/20"
              >
                Удалить выбранные: {selectedIds.length}
              </button>
            )}

            <button
              onClick={onClear}
              className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/20"
            >
              Очистить всё
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-400/10 text-4xl">
            ✨
          </div>

          <p className="mt-6 text-2xl font-black">История пока пустая</p>

          <p className="mx-auto mt-3 max-w-md text-gray-400 leading-relaxed">
            После первой генерации здесь появятся ваши тексты, сценарии,
            идеи и другие результаты.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr]">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Поиск
                </label>

                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Тема, текст, площадка или стиль..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-violet-300/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Площадка
                </label>

                <select
                  value={platformFilter}
                  onChange={(event) => {
                    setPlatformFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/50"
                >
                  <option value="all">Все площадки</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Стиль
                </label>

                <select
                  value={styleFilter}
                  onChange={(event) => {
                    setStyleFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/50"
                >
                  <option value="all">Все стили</option>
                  {styles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Сортировка
                </label>

                <select
                  value={sortMode}
                  onChange={(event) => {
                    setSortMode(event.target.value as SortMode);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300/50"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="oldest">Сначала старые</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
              <p className="text-sm text-gray-400">
                Найдено: <span className="font-bold text-white">{filteredHistory.length}</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleSelectPage}
                  disabled={paginatedHistory.length === 0}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isAllPageSelected ? "Снять выбор" : "Выбрать страницу"}
                </button>

                <button
                  onClick={resetFilters}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.08]"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-xl font-black">Ничего не найдено</p>
              <p className="mt-2 text-gray-400">
                Попробуй изменить запрос или сбросить фильтры.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paginatedHistory.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <article
                      key={item.id}
                      className={`group relative overflow-hidden rounded-[30px] border bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] ${
                        isSelected
                          ? "border-cyan-300/50 ring-2 ring-cyan-300/20"
                          : "border-white/10 hover:border-violet-300/40"
                      }`}
                    >
                      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
                      </div>

                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-violet-400/10 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
                              {item.platform || "Площадка"}
                            </span>

                            <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                              {item.style || "Стиль"}
                            </span>
                          </div>

                          <label
                            className="flex cursor-pointer items-center gap-2 text-xs text-gray-400"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelected(item.id)}
                              className="h-4 w-4 accent-cyan-300"
                            />
                          </label>
                        </div>

                        <button
                          onClick={() => onOpenItem(item)}
                          className="block w-full text-left"
                        >
                          <h3 className="line-clamp-2 text-xl font-black leading-snug text-white transition group-hover:text-violet-100">
                            {item.topic}
                          </h3>

                          <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-gray-400">
                            {item.result}
                          </p>
                        </button>

                        <div className="mt-6 border-t border-white/5 pt-4">
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Создано
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {formatHistoryDate(item.created_at)}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onOpenItem(item)}
                            className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/20"
                          >
                            Открыть
                          </button>

                          <button
                            onClick={() => handleCopy(item)}
                            className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.09]"
                          >
                            {copiedId === item.id ? "Скопировано" : "Копировать"}
                          </button>

                          <button
                            onClick={() => handleShare(item)}
                            className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.09]"
                          >
                            Поделиться
                          </button>

                          {onDeleteItems && (
                            <button
                              onClick={() => handleDeleteOne(item.id)}
                              className="rounded-2xl bg-red-400/10 px-3 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/20"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Назад
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                    Страница <span className="font-bold text-white">{currentPage}</span> из{" "}
                    <span className="font-bold text-white">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-gray-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Вперёд →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

