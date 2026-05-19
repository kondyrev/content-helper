type ResultCardProps = {
  title: string;
  content: string;
  copiedTitle: string;
  onCopy: (title: string, content: string) => void;
};

export function ResultCard({
  title,
  content,
  copiedTitle,
  onCopy,
}: ResultCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-cyan-300/10">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-cyan-200">
            {title}
          </h3>

          <button
            onClick={() => onCopy(title, content)}
            className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
          >
            {copiedTitle === title ? "Готово" : "Копировать"}
          </button>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
          {content}
        </p>
      </div>
    </div>
  );
}