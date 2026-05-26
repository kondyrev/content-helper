type UsersHeaderProps = {
  totalUsers: number;
  adminUsers: number;
  paidUsers: number;
};

export function UsersHeader({
  totalUsers,
  adminUsers,
  paidUsers,
}: UsersHeaderProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-200">
            User Management
          </div>

          <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.07em] sm:text-5xl">
            Пользователи
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Поиск, фильтрация и быстрый обзор пользователей, тарифов,
            ролей и статусов подписки.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <UserMiniStat label="Всего" value={totalUsers} />

          <UserMiniStat label="Admin" value={adminUsers} />

          <UserMiniStat label="Paid" value={paidUsers} />
        </div>
      </div>
    </section>
  );
}

function UserMiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-black tracking-tight">
        {value}
      </div>
    </div>
  );
}