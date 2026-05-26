import { MetricCard } from "./MetricCard";

type Props = {
  profilesCount: number;
  activeSubscriptions: number;
  estimatedRevenue: number;
  freeCount: number;
  creatorCount: number;
  smmProCount: number;
};

export function AdminMetricsGrid({
  profilesCount,
  activeSubscriptions,
  estimatedRevenue,
  freeCount,
  creatorCount,
  smmProCount,
}: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Пользователи"
        value={profilesCount.toString()}
        description="profiles"
      />

      <MetricCard
        label="Активные подписки"
        value={activeSubscriptions.toString()}
        description="creator / smm_pro"
      />

      <MetricCard
        label="MRR"
        value={`${estimatedRevenue.toLocaleString("ru-RU")} ₽`}
        description="активные тарифы"
      />

      <MetricCard
        label="Тарифы"
        value={`${freeCount}/${creatorCount}/${smmProCount}`}
        description="free / creator / smm_pro"
      />
    </section>
  );
}