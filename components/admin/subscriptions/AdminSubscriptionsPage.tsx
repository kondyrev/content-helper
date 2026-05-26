"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminOverview } from "@/lib/admin/queries";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlanPill, StatusPill } from "@/components/admin/users/UserPills";

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
  current_period_end: string | null;
  plans: {
    id: string;
    name: string;
    daily_limit: number;
    price_month: number;
  } | null;
};

type AccountResponse = {
  profile: Profile;
  profiles: Profile[];
  subscriptions: Subscription[];
};

export default function AdminSubscriptionsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const accountData = (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);
      } catch (error) {
        console.error("Admin subscriptions load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscriptions();
  }, [router]);

  const profilesMap = useMemo(() => {
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }, [profiles]);

  const paidSubscriptions = subscriptions.filter(
    (item) => item.status === "active" && item.plan_id !== "free",
  );

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active",
  );

  const expiredSubscriptions = subscriptions.filter((item) => {
    if (!item.current_period_end) return false;
    return new Date(item.current_period_end).getTime() < Date.now();
  });

  const monthlyRevenue = paidSubscriptions.reduce((sum, item) => {
    return sum + (item.plans?.price_month || 0);
  }, 0);

  const upcomingExpirations = subscriptions.filter((item) => {
    if (!item.current_period_end) return false;

    const end = new Date(item.current_period_end).getTime();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return end >= now && end <= now + sevenDays;
  });

  const filteredSubscriptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subscriptions
      .filter((subscription) => {
        const profile = profilesMap.get(subscription.user_id);
        const email = profile?.email || "";

        const matchesSearch =
          !normalizedSearch ||
          email.toLowerCase().includes(normalizedSearch) ||
          subscription.user_id.toLowerCase().includes(normalizedSearch);

        const matchesPlan =
          planFilter === "all" || subscription.plan_id === planFilter;

        const matchesStatus =
          statusFilter === "all" || subscription.status === statusFilter;

        return matchesSearch && matchesPlan && matchesStatus;
      })
      .sort((a, b) => {
        const aTime = a.current_period_end
          ? new Date(a.current_period_end).getTime()
          : 0;
        const bTime = b.current_period_end
          ? new Date(b.current_period_end).getTime()
          : 0;

        return bTime - aTime;
      });
  }, [subscriptions, profilesMap, search, planFilter, statusFilter]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-[520px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (!adminProfile) {
    return null;
  }

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                Subscription Management
              </div>

              <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.07em] sm:text-5xl">
                Подписки
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Контроль активных тарифов, истечений, MRR и пользовательских
                подписок. Сейчас безопасная read-only версия.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[620px]">
              <MiniStat label="Active" value={activeSubscriptions.length} />
              <MiniStat label="Paid" value={paidSubscriptions.length} />
              <MiniStat
                label="MRR"
                value={`${monthlyRevenue.toLocaleString("ru-RU")} ₽`}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <OverviewCard
            title="Истекают скоро"
            value={upcomingExpirations.length.toString()}
            description="current_period_end в ближайшие 7 дней"
          />

          <OverviewCard
            title="Истёкшие"
            value={expiredSubscriptions.length.toString()}
            description="подписки с прошедшей датой окончания"
          />

          <OverviewCard
            title="Средний чек"
            value={
              paidSubscriptions.length
                ? `${Math.round(monthlyRevenue / paidSubscriptions.length).toLocaleString(
                    "ru-RU",
                  )} ₽`
                : "0 ₽"
            }
            description="по активным платным подпискам"
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по email или user id..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
              >
                <option value="all">Все тарифы</option>
                <option value="free">free</option>
                <option value="creator">creator</option>
                <option value="smm_pro">smm_pro</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="active">active</option>
                <option value="expired">expired</option>
                <option value="canceled">canceled</option>
                <option value="free">free</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredSubscriptions.map((subscription) => {
                  const profile = profilesMap.get(subscription.user_id);

                  return (
                    <tr
                      key={`${subscription.user_id}-${subscription.plan_id}`}
                      className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xs font-black">
                            {profile?.email?.slice(0, 2).toUpperCase() || "U"}
                          </div>

                          <div>
                            <div className="text-sm font-bold text-slate-200">
                              {profile?.email || "Без email"}
                            </div>

                            <div className="mt-1 max-w-[260px] truncate text-xs text-slate-600">
                              {subscription.user_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4">
                        <PlanPill plan={subscription.plan_id} />
                      </td>

                      <td className="px-2 py-4">
                        <StatusPill status={subscription.status} />
                      </td>

                      <td className="px-2 py-4 text-sm text-slate-400">
                        {subscription.plans?.daily_limit ?? "—"}
                      </td>

                      <td className="px-2 py-4 text-sm font-bold text-slate-200">
                        {(subscription.plans?.price_month || 0).toLocaleString(
                          "ru-RU",
                        )}{" "}
                        ₽
                      </td>

                      <td className="px-2 py-4 text-sm text-slate-500">
                        {subscription.current_period_end
                          ? new Date(
                              subscription.current_period_end,
                            ).toLocaleDateString("ru-RU")
                          : "—"}
                      </td>

                      <td className="px-2 py-4">
                        <button
                          onClick={() =>
                            router.push(`/admin/users/${subscription.user_id}`)
                          }
                          className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                        >
                          Открыть
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-12 text-center text-sm text-slate-500"
                    >
                      Подписки не найдены.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="text-sm font-semibold text-slate-400">{title}</div>
      <div className="mt-3 text-4xl font-black tracking-[-0.06em]">
        {value}
      </div>
      <div className="mt-4 text-xs text-slate-500">{description}</div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
      {children}
    </th>
  );
}