type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type Subscription = {
  user_id: string;
  plan_id: string;
  status: string;
};

type UsersPreviewTableProps = {
  profiles: Profile[];
  subscriptions: Subscription[];
};

export function UsersPreviewTable({
  profiles,
  subscriptions,
}: UsersPreviewTableProps) {
  const latestUsers = [...profiles]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  function getUserSubscription(userId: string) {
    return subscriptions.find((item) => item.user_id === userId);
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Последние пользователи</div>
          <div className="mt-1 text-xs text-slate-500">
            Быстрый доступ к профилю, тарифу, лимитам и платежам
          </div>
        </div>

        <a
          href="/admin/users"
          className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
        >
          Все пользователи
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] text-left">
              <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                User
              </th>
              <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                Plan
              </th>
              <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                Role
              </th>
              <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {latestUsers.map((user) => {
              const subscription = getUserSubscription(user.id);

              return (
                <tr key={user.id} className="border-b border-white/[0.06]">
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xs font-black">
                        {user.email?.slice(0, 2).toUpperCase() || "U"}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-200">
                          {user.email || "Без email"}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {new Date(user.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-4">
                    <PlanPill plan={subscription?.plan_id || "free"} />
                  </td>

                  <td className="px-2 py-4 text-sm text-slate-400">
                    {user.role}
                  </td>

                  <td className="px-2 py-4">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
                      {subscription?.status || "free"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlanPill({ plan }: { plan: string }) {
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