"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminOverview } from "@/lib/admin/queries";
import { AdminShell } from "@/components/admin/AdminShell";

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

export default function AdminUsersPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    async function loadUsers() {
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
        console.error("Admin users load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [router]);

  const subscriptionByUserId = useMemo(() => {
    return new Map(subscriptions.map((item) => [item.user_id, item]));
  }, [subscriptions]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return profiles
      .filter((user) => {
        const subscription = subscriptionByUserId.get(user.id);
        const plan = subscription?.plan_id || "free";

        const matchesSearch =
          !normalizedSearch ||
          user.email?.toLowerCase().includes(normalizedSearch) ||
          user.id.toLowerCase().includes(normalizedSearch);

        const matchesRole =
          roleFilter === "all" || user.role === roleFilter;

        const matchesPlan =
          planFilter === "all" || plan === planFilter;

        return matchesSearch && matchesRole && matchesPlan;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [profiles, roleFilter, planFilter, search, subscriptionByUserId]);

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
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-200">
                User Management
              </div>

              <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.07em] sm:text-5xl">
                Пользователи
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Поиск, фильтрация и быстрый обзор пользователей, тарифов,
                ролей и статусов подписки. На следующем этапе добавим actions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <UserMiniStat label="Всего" value={profiles.length} />
              <UserMiniStat
                label="Admin"
                value={profiles.filter((item) => item.role === "admin").length}
              />
              <UserMiniStat
                label="Paid"
                value={
                  subscriptions.filter(
                    (item) =>
                      item.status === "active" && item.plan_id !== "free",
                  ).length
                }
              />
            </div>
          </div>
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
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
              >
                <option value="all">Все роли</option>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

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
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const subscription = subscriptionByUserId.get(user.id);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xs font-black">
                            {user.email?.slice(0, 2).toUpperCase() || "U"}
                          </div>

                          <div>
                            <div className="text-sm font-bold text-slate-200">
                              {user.email || "Без email"}
                            </div>
                            <div className="mt-1 max-w-[260px] truncate text-xs text-slate-600">
                              {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4">
                        <PlanPill plan={subscription?.plan_id || "free"} />
                      </td>

                      <td className="px-2 py-4">
                        <RolePill role={user.role} />
                      </td>

                      <td className="px-2 py-4">
                        <StatusPill status={subscription?.status || "free"} />
                      </td>

                      <td className="px-2 py-4 text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </td>

                      <td className="px-2 py-4">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                        >
                          Открыть
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-2 py-12 text-center text-sm text-slate-500"
                    >
                      Пользователи не найдены.
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

function UserMiniStat({
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

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
      {children}
    </th>
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

function RolePill({ role }: { role: string }) {
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

function StatusPill({ status }: { status: string }) {
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