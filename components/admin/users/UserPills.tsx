export function PlanPill({ plan }: { plan: string }) {
  const className =
    plan === "smm_pro"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      : plan === "creator"
        ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
        : "border-white/10 bg-white/[0.055] text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${className}`}
    >
      {plan}
    </span>
  );
}

export function RolePill({ role }: { role: string }) {
  const className =
    role === "admin"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : "border-white/10 bg-white/[0.055] text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${className}`}
    >
      {role}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-white/10 bg-white/[0.055] text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}