"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";

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

export default function AdminOverviewPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/");
          return;
        }

        const response = await fetch("/api/account/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || data?.error) {
          router.replace("/");
          return;
        }

        const accountData = data as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);
      } catch (error) {
        console.error("Admin load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdmin();
  }, [router, supabase]);

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active" && item.plan_id !== "free"
  );

  const freeCount = subscriptions.filter(
    (item) => item.plan_id === "free"
  ).length;

  const creatorCount = subscriptions.filter(
    (item) => item.plan_id === "creator"
  ).length;

  const smmProCount = subscriptions.filter(
    (item) => item.plan_id === "smm_pro"
  ).length;

  const estimatedMonthlyRevenue = subscriptions.reduce((sum, item) => {
    if (item.status !== "active") return sum;
    return sum + (item.plans?.price_month || 0);
  }, 0);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-3xl bg-white/10"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#070812] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.16),transparent_30%)]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-screen border-r border-white/10 bg-[#070812]/75 px-4 py-5 backdrop-blur-2xl lg:sticky lg:top-0 lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 font-black shadow-[0_18px_40px_rgba(139,92,246,0.3)]">
              КП
            </div>

            <div>
              <div className="text-sm font-bold tracking-tight">
                КонтентПомощник
              </div>

              <div className="text-xs text-slate-500">
                Admin Control Center
              </div>
            </div>
          </div>

          <nav className="space-y-7">
            <AdminNavGroup
              label="Главное"
              items={[
                ["⌘", "Overview", "/admin"],
                ["◎", "Analytics", "/admin/analytics"],
                ["◌", "Activity", "/admin/audit"],
              ]}
            />

            <AdminNavGroup
              label="Управление"
              items={[
                ["◍", "Users", "/admin/users"],
                ["◐", "Payments", "/admin/payments"],
                ["◒", "Subscriptions", "/admin/subscriptions"],
                ["✦", "Support", "/admin/support"],
              ]}
            />

            <AdminNavGroup
              label="Контент"
              items={[
                ["✎", "Landing CMS", "/admin/cms"],
                ["◇", "SEO", "/admin/cms/seo"],
                ["☰", "Pricing", "/admin/cms/pricing"],
              ]}
            />
          </nav>

          <div className="absolute bottom-5 left-4 right-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl">
            <div className="text-sm font-bold">Production mode</div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              content-helper.ru работает стабильно. Админка доступна только роли
              admin.
            </p>
          </div>
        </aside>

        <section className="min-w-0 px-4 pb-8 pt-4 sm:px-6 lg:px-7">
          <header className="sticky top-0 z-20 flex flex-col gap-3 bg-gradient-to-b from-[#070812] via-[#070812]/90 to-transparent pb-4 pt-1 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500 sm:max-w-2xl">
              <span>⌕</span>

              <input
                placeholder="Поиск пользователей, платежей, тикетов, логов..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="h-11 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-slate-200">
                Экспорт
              </button>

              <button className="h-11 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500 to-indigo-500 px-4 text-sm font-bold text-white">
                + Быстрое действие
              </button>

              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.08] text-xs font-black">
                {profile.email?.slice(0, 2).toUpperCase() || "AD"}
              </div>
            </div>
          </header>

          <div className="space-y-5">
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
                    <div className="text-sm font-bold">System Health</div>

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
                  {["Supabase", "Robokassa", "OpenAI API", "PM2 / Nginx"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-3 py-3 text-sm"
                      >
                        <span>{item}</span>

                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
                          ok
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Пользователи"
                value={profiles.length.toString()}
                description="profiles"
              />

              <MetricCard
                label="Активные подписки"
                value={activeSubscriptions.length.toString()}
                description="creator / smm_pro"
              />

              <MetricCard
                label="MRR"
                value={`${estimatedMonthlyRevenue.toLocaleString("ru-RU")} ₽`}
                description="активные тарифы"
              />

              <MetricCard
                label="Тарифы"
                value={`${freeCount}/${creatorCount}/${smmProCount}`}
                description="free / creator / smm_pro"
              />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminNavGroup({
  label,
  items,
}: {
  label: string;
  items: [string, string, string][];
}) {
  return (
    <div>
      <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="space-y-1">
        {items.map(([icon, title, href]) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <span className="grid h-5 w-5 place-items-center text-slate-400">
              {icon}
            </span>

            {title}
          </a>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="text-sm font-semibold text-slate-400">{label}</div>

      <div className="mt-3 text-4xl font-black tracking-[-0.06em]">
        {value}
      </div>

      <div className="mt-4 text-xs text-slate-500">{description}</div>
    </div>
  );
}