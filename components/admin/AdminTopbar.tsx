type AdminTopbarProps = {
  email: string | null;
};

export function AdminTopbar({ email }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 bg-gradient-to-b from-[#070812] via-[#070812]/90 to-transparent pb-4 pt-1 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500 sm:max-w-2xl">
        <span>⌕</span>

        <input
          placeholder="Поиск пользователей, платежей, тикетов, логов..."
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="h-11 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-slate-200">
          Экспорт
        </button>

        <button className="h-11 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500 to-indigo-500 px-4 text-sm font-bold text-white">
          + Быстрое действие
        </button>

        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-xs font-black">
          {email?.slice(0, 2).toUpperCase() || "AD"}
        </div>
      </div>
    </header>
  );
}