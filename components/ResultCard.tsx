type ResultCardProps = {
  title: string;
  content: string;
  copiedTitle: string;
  onCopy: (title: string, content: string) => void;
};

const iconByTitle: Record<string, string> = {
  Заголовок: "✨",
  Описание: "📝",
  CTA: "🔥",
  Хештеги: "#️⃣",
  "Первый комментарий": "💬",
  "Идея для обложки": "🎨",
  "Идеи для обложки": "🎨",
};

export function ResultCard({
  title,
  content,
  copiedTitle,
  onCopy,
}: ResultCardProps) {
  const icon = iconByTitle[title] || "⚡";
  const isCopied = copiedTitle === title;

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-1 shadow-xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-2xl hover:shadow-cyan-300/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_35%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-xl">
              {icon}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                AI block
              </p>

              <h3 className="mt-1 text-xl font-black text-white">{title}</h3>
            </div>
          </div>

          <button
            onClick={() => onCopy(title, content)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-black transition ${
              isCopied
                ? "bg-emerald-300 text-black"
                : "border border-white/10 bg-white/5 text-gray-200 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
            }`}
          >
            {isCopied ? "Скопировано" : "Копировать"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#070b16]/70 p-5">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-100">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}