type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

export function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="text-sm font-semibold text-slate-400">
        {label}
      </div>

      <div className="mt-3 text-4xl font-black tracking-[-0.06em]">
        {value}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        {description}
      </div>
    </div>
  );
}