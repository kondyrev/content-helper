const chartValues = [32, 44, 38, 52, 29, 66, 71, 58, 40, 78, 64, 86, 74, 92];

type AdminRevenueChartProps = {
  revenue: number;
  activeSubscriptions: number;
};

export function AdminRevenueChart({
  revenue,
  activeSubscriptions,
}: AdminRevenueChartProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Revenue & Growth</div>
          <div className="mt-1 text-xs text-slate-500">
            Динамика выручки и роста. Сейчас mock chart, далее подключим daily_metrics.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right">
          <div className="text-xs text-slate-500">MRR estimate</div>
          <div className="mt-1 text-lg font-black tracking-tight">
            {revenue.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-72 items-end gap-2 rounded-3xl border border-white/[0.07] bg-black/10 p-4">
        {chartValues.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-full bg-gradient-to-b from-violet-500 to-cyan-400/40"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Активные подписки" value={activeSubscriptions} />
        <MiniStat label="Средний чек" value="590 ₽" />
        <MiniStat label="Период" value="14 дней" />
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black tracking-tight">{value}</div>
    </div>
  );
}