type RecentActivityPanelProps = {
  usersCount: number;
  activeSubscriptions: number;
};

export function RecentActivityPanel({
  usersCount,
  activeSubscriptions,
}: RecentActivityPanelProps) {
  const items = [
    {
      icon: "U",
      title: `${usersCount} пользователей в системе`,
      meta: "profiles table",
      time: "live",
    },
    {
      icon: "₽",
      title: `${activeSubscriptions} активных подписок`,
      meta: "creator / smm_pro",
      time: "live",
    },
    {
      icon: "AI",
      title: "AI usage подключим далее",
      meta: "generation history / analytics events",
      time: "soon",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div>
        <div className="text-sm font-bold">Recent Activity</div>
        <div className="mt-1 text-xs text-slate-500">
          Последние события платформы
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.045] px-3 py-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-xs font-black text-violet-200">
              {item.icon}
            </div>

            <div>
              <div className="text-sm font-bold text-slate-200">
                {item.title}
              </div>
              <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
            </div>

            <div className="text-xs text-slate-600">{item.time}</div>
          </div>
        ))}
      </div>
    </section>
  );
}