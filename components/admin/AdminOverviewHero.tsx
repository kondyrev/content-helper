export function AdminOverviewHero() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live SaaS Overview
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-none tracking-[-0.07em] sm:text-6xl">
          Центр управления КонтентПомощником
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Один экран для контроля пользователей, оплат, подписок,
          генераций, тикетов, CMS лендинга и системных событий.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold">
              System Health
            </div>

            <div className="mt-1 text-xs text-slate-500">
              API, Robokassa, Supabase, OpenAI
            </div>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
            Healthy
          </span>
        </div>

        <div className="mx-auto my-6 grid h-28 w-28 place-items-center rounded-full bg-[conic-gradient(from_180deg,#34d399_0_78%,rgba(255,255,255,0.08)_78%_100%)]">
          <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-[#111428] text-3xl font-black tracking-tighter">
            98
          </div>
        </div>

        <div className="space-y-2">
          {[
            "Supabase",
            "Robokassa",
            "OpenAI API",
            "PM2 / Nginx",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-3 py-3 text-sm"
            >
              <span>{item}</span>

              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
                ok
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}