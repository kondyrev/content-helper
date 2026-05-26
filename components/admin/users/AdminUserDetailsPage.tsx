"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    async function loadUserDetails() {
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
        console.error("Admin user details load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserDetails();
  }, [router]);

  const user = useMemo(() => {
    return profiles.find((item) => item.id === params.userId) || null;
  }, [profiles, params.userId]);

  const subscription = useMemo(() => {
    return subscriptions.find((item) => item.user_id === params.userId) || null;
  }, [subscriptions, params.userId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-[620px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (!adminProfile) {
    return null;
  }

  if (!user) {
    return (
      <AdminShell adminEmail={adminProfile.email}>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="text-2xl font-black tracking-tight">
            Пользователь не найден
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Возможно, пользователь был удалён или указан неверный user id.
          </p>
          <button
            onClick={() => router.push("/admin/users")}
            className="mt-6 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Вернуться к пользователям
          </button>
        </div>
      </AdminShell>
    );
  }

  const planId = subscription?.plan_id || "free";
  const status = subscription?.status || "free";
  const planName = subscription?.plans?.name || planId;
  const dailyLimit = subscription?.plans?.daily_limit ?? 0;
  const priceMonth = subscription?.plans?.price_month ?? 0;

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <button
            onClick={() => router.push("/admin/users")}
            className="mb-6 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
          >
            ← Назад к пользователям
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-200">
                User Profile
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
                {user.email || "Пользователь без email"}
              </h1>

              <p className="mt-4 max-w-3xl break-all text-sm leading-7 text-slate-400">
                {user.id}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <RolePill role={user.role} />
              <PlanPill plan={planId} />
              <StatusPill status={status} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            <InfoCard
              title="Профиль"
              items={[
                ["Email", user.email || "—"],
                ["Role", user.role],
                [
                  "Created",
                  new Date(user.created_at).toLocaleString("ru-RU"),
                ],
                ["User ID", user.id],
              ]}
            />

            <InfoCard
              title="Подписка"
              items={[
                ["Plan", planName],
                ["Plan ID", planId],
                ["Status", status],
                ["Daily limit", dailyLimit.toString()],
                ["Price / month", `${priceMonth.toLocaleString("ru-RU")} ₽`],
                [
                  "Period end",
                  subscription?.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleString(
                        "ru-RU",
                      )
                    : "—",
                ],
              ]}
            />

            <MetricBox
              label="Генерации"
              value="—"
              description="Подключим generation history"
            />

            <MetricBox
              label="Платежи"
              value="—"
              description="Подключим payments table"
            />
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
            <div className="text-sm font-bold">Admin Actions</div>
            <div className="mt-1 text-xs text-slate-500">
              Пока read-only. Actions подключим безопасно через audit logs.
            </div>

            <div className="mt-5 space-y-3">
              <ActionButton disabled>Сменить тариф</ActionButton>
              <ActionButton disabled>Продлить подписку</ActionButton>
              <ActionButton disabled>Изменить роль</ActionButton>
              <ActionButton disabled>Управлять лимитами</ActionButton>
              <ActionButton disabled danger>
                Заблокировать пользователя
              </ActionButton>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
              Перед включением действий добавим server-side API routes, RLS,
              service-role проверки и admin_audit_logs.
            </div>
          </aside>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <PlaceholderPanel
            title="Generation History"
            subtitle="История AI генераций пользователя"
            items={[
              "последние генерации",
              "использованные лимиты",
              "темы видео",
              "дата и статус",
            ]}
          />

          <PlaceholderPanel
            title="Payments"
            subtitle="История оплат и Robokassa events"
            items={[
              "успешные платежи",
              "ошибки оплат",
              "invoice id",
              "refund/manual activation",
            ]}
          />

          <PlaceholderPanel
            title="Support Tickets"
            subtitle="Обращения пользователя в поддержку"
            items={[
              "открытые тикеты",
              "статусы",
              "приоритеты",
              "последние сообщения",
            ]}
          />
        </section>
      </div>
    </AdminShell>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-4 text-sm font-bold">{title}</div>

      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div className="text-xs font-semibold text-slate-500">{label}</div>
            <div className="mt-1 break-all text-sm font-bold text-slate-200">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="text-sm font-semibold text-slate-400">{label}</div>
      <div className="mt-3 text-4xl font-black tracking-[-0.06em]">
        {value}
      </div>
      <div className="mt-4 text-xs text-slate-500">{description}</div>
    </div>
  );
}

function PlaceholderPanel({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{subtitle}</div>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
        danger
          ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
          : "border-white/10 bg-white/[0.055] text-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-white/[0.08]"}`}
    >
      {children}
    </button>
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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${className}`}
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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${className}`}
    >
      {role}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-white/10 bg-white/[0.055] text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}