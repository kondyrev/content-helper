"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { getAdminOverview } from "@/lib/admin/queries";
import {
  AdminPayment,
  getAdminPayments,
} from "@/lib/admin/payments";
import { AdminShell } from "@/components/admin/AdminShell";
import { UserPaymentsPanel } from "./UserPaymentsPanel";
import {
  PlanPill,
  RolePill,
  StatusPill,
} from "./UserPills";

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
  plans?: {
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

type PlanId = "free" | "creator" | "smm_pro";

type SubscriptionActionMode =
  | "change_only"
  | "activate_30"
  | "extend_30"
  | "extend_90"
  | "set_custom_date"
  | "reset_free";

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);

  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);

  const [adminProfile, setAdminProfile] =
    useState<Profile | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Subscription[]
  >([]);

  const [payments, setPayments] = useState<AdminPayment[]>([]);

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    useState(false);

  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>("creator");

  const [selectedMode, setSelectedMode] =
    useState<SubscriptionActionMode>("change_only");

  const [customDateTime, setCustomDateTime] = useState("");

  useEffect(() => {
    async function loadUserDetails() {
      try {
        const accountData =
          (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);

        const paymentsData = await getAdminPayments();

        setPayments(
          paymentsData.filter(
            (payment) => payment.user_id === params.userId,
          ),
        );
      } catch (error) {
        console.error(
          "Admin user details load error:",
          error,
        );

        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserDetails();
  }, [params.userId, router]);

  const user = useMemo(() => {
    return (
      profiles.find(
        (item) => item.id === params.userId,
      ) || null
    );
  }, [profiles, params.userId]);

  const subscription = useMemo(() => {
    return (
      subscriptions.find(
        (item) => item.user_id === params.userId,
      ) || null
    );
  }, [subscriptions, params.userId]);

  async function handleUpdateRole(
    newRole: "user" | "admin",
  ) {
    if (!user) return;

    setRoleError(null);
    setRoleSuccess(null);

    if (user.role === newRole) {
      setRoleError(
        `У пользователя уже роль ${newRole}.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Точно изменить роль пользователя ${
        user.email || user.id
      } на "${newRole}"?`,
    );

    if (!confirmed) return;

    try {
      setIsRoleUpdating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/");
        return;
      }

      const response = await fetch(
        "/api/admin/users/update-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            targetUserId: user.id,
            newRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data?.error) {
        throw new Error(
          data?.error ||
            "Не удалось изменить роль.",
        );
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === user.id
            ? { ...profile, role: newRole }
            : profile,
        ),
      );

      setRoleSuccess(
        `Роль успешно изменена на ${newRole}.`,
      );
    } catch (error) {
      console.error(
        "Update role client error:",
        error,
      );

      setRoleError(
        error instanceof Error
          ? error.message
          : "Не удалось изменить роль пользователя.",
      );
    } finally {
      setIsRoleUpdating(false);
    }
  }

  async function handleManageSubscription() {
    if (!user) return;

    setPlanError(null);
    setPlanSuccess(null);

    try {
      setIsPlanUpdating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/");
        return;
      }

      let customPeriodEnd: string | undefined;

      if (selectedMode === "set_custom_date") {
        if (!customDateTime) {
          throw new Error(
            "Выбери дату и время окончания подписки.",
          );
        }

        const parsedDate = new Date(customDateTime);

        if (Number.isNaN(parsedDate.getTime())) {
          throw new Error(
            "Некорректная дата окончания подписки.",
          );
        }

        customPeriodEnd = parsedDate.toISOString();
      }

      const response = await fetch(
        "/api/admin/subscriptions/change-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            targetUserId: user.id,
            newPlanId: selectedPlan,
            mode: selectedMode,
            customPeriodEnd,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data?.error) {
        throw new Error(
          data?.error ||
            "Не удалось обновить подписку.",
        );
      }

      const nextSubscription =
        data.subscription as Subscription;

      setSubscriptions((currentSubscriptions) => {
        const exists = currentSubscriptions.some(
          (item) => item.user_id === user.id,
        );

        if (!exists) {
          return [
            ...currentSubscriptions,
            nextSubscription,
          ];
        }

        return currentSubscriptions.map((item) =>
          item.user_id === user.id
            ? {
                ...item,
                plan_id: nextSubscription.plan_id,
                status: nextSubscription.status,
                current_period_end:
                  nextSubscription.current_period_end,
              }
            : item,
        );
      });

      setPlanSuccess(
        "Подписка успешно обновлена.",
      );

      setIsSubscriptionModalOpen(false);
    } catch (error) {
      console.error(
        "Manage subscription client error:",
        error,
      );

      setPlanError(
        error instanceof Error
          ? error.message
          : "Не удалось обновить подписку.",
      );
    } finally {
      setIsPlanUpdating(false);
    }
  }

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
        </div>
      </AdminShell>
    );
  }

  const planId = subscription?.plan_id || "free";
  const status = subscription?.status || "active";

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <button
            onClick={() =>
              router.push("/admin/users")
            }
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
                {user.email ||
                  "Пользователь без email"}
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
                  new Date(
                    user.created_at,
                  ).toLocaleString("ru-RU"),
                ],
                ["User ID", user.id],
              ]}
            />

            <InfoCard
              title="Подписка"
              items={[
                ["Plan", planId],
                ["Status", status],
                [
                  "Period end",
                  subscription?.current_period_end
                    ? new Date(
                        subscription.current_period_end,
                      ).toLocaleString("ru-RU")
                    : "—",
                ],
              ]}
            />
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
            <div className="text-sm font-bold">
              Admin Actions
            </div>

            <div className="mt-5 space-y-3">
              <ActionButton
                disabled={
                  isRoleUpdating ||
                  user.role === "user"
                }
                onClick={() =>
                  handleUpdateRole("user")
                }
              >
                Сделать user
              </ActionButton>

              <ActionButton
                disabled={
                  isRoleUpdating ||
                  user.role === "admin"
                }
                onClick={() =>
                  handleUpdateRole("admin")
                }
              >
                Сделать admin
              </ActionButton>

              <ActionButton
                onClick={() => {
                  setSelectedPlan(
                    planId as PlanId,
                  );

                  setSelectedMode(
                    "change_only",
                  );

                  setCustomDateTime("");

                  setPlanError(null);
                  setPlanSuccess(null);

                  setIsSubscriptionModalOpen(
                    true,
                  );
                }}
              >
                Управлять тарифом
              </ActionButton>
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

          <UserPaymentsPanel
            payments={payments}
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

        {roleError ? (
          <MessageBox
            type="error"
            message={roleError}
          />
        ) : null}

        {roleSuccess ? (
          <MessageBox
            type="success"
            message={roleSuccess}
          />
        ) : null}

        {planError ? (
          <MessageBox
            type="error"
            message={planError}
          />
        ) : null}

        {planSuccess ? (
          <MessageBox
            type="success"
            message={planSuccess}
          />
        ) : null}
      </div>

      {isSubscriptionModalOpen ? (
        <SubscriptionModal
          selectedPlan={selectedPlan}
          selectedMode={selectedMode}
          customDateTime={customDateTime}
          isUpdating={isPlanUpdating}
          onPlanChange={setSelectedPlan}
          onModeChange={setSelectedMode}
          onCustomDateTimeChange={
            setCustomDateTime
          }
          onClose={() =>
            setIsSubscriptionModalOpen(false)
          }
          onSubmit={
            handleManageSubscription
          }
        />
      ) : null}
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
      <div className="mb-4 text-sm font-bold">
        {title}
      </div>

      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div className="text-xs font-semibold text-slate-500">
              {label}
            </div>

            <div className="mt-1 break-all text-sm font-bold text-slate-200">
              {value}
            </div>
          </div>
        ))}
      </div>
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
      <div className="text-sm font-bold">
        {title}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {subtitle}
      </div>

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
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function MessageBox({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  const className =
    type === "error"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${className}`}
    >
      {message}
    </div>
  );
}

function SubscriptionModal({
  selectedPlan,
  selectedMode,
  customDateTime,
  isUpdating,
  onPlanChange,
  onModeChange,
  onCustomDateTimeChange,
  onClose,
  onSubmit,
}: {
  selectedPlan: PlanId;
  selectedMode: SubscriptionActionMode;
  customDateTime: string;
  isUpdating: boolean;
  onPlanChange: (value: PlanId) => void;
  onModeChange: (value: SubscriptionActionMode) => void;
  onCustomDateTimeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0b0d1a] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-black tracking-tight">
              Управлять тарифом
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-500">
              Выбери тариф и действие. Все изменения будут записаны в audit
              logs.
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-slate-300 transition hover:bg-white/[0.08]"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
              Тариф
            </div>

            <select
              value={selectedPlan}
              onChange={(event) => onPlanChange(event.target.value as PlanId)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
            >
              <option value="free">free</option>
              <option value="creator">creator</option>
              <option value="smm_pro">smm_pro</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
              Действие
            </div>

            <div className="grid gap-2">
              <ModeOption
                value="change_only"
                current={selectedMode}
                title="Сменить тариф без изменения даты"
                description="Меняет только plan_id, срок действия остаётся прежним."
                onChange={onModeChange}
              />

              <ModeOption
                value="activate_30"
                current={selectedMode}
                title="Сменить тариф и активировать на 30 дней"
                description="Срок окончания станет +30 дней от текущей даты."
                onChange={onModeChange}
              />

              <ModeOption
                value="extend_30"
                current={selectedMode}
                title="Продлить на 30 дней"
                description="Добавляет 30 дней к текущему сроку или от сегодня, если срок истёк."
                onChange={onModeChange}
              />

              <ModeOption
                value="extend_90"
                current={selectedMode}
                title="Продлить на 90 дней"
                description="Добавляет 90 дней к текущему сроку или от сегодня, если срок истёк."
                onChange={onModeChange}
              />

              <ModeOption
                value="set_custom_date"
                current={selectedMode}
                title="Установить дату вручную"
                description="Позволяет выбрать точную дату и время окончания подписки."
                onChange={onModeChange}
              />

              <ModeOption
                value="reset_free"
                current={selectedMode}
                title="Сбросить на free"
                description="Переводит пользователя на free и очищает дату окончания."
                onChange={onModeChange}
              />
            </div>
          </div>

          {selectedMode === "set_custom_date" ? (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                Дата и время окончания
              </div>

              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(event) =>
                  onCustomDateTimeChange(event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            onClick={onSubmit}
            disabled={isUpdating}
            className="rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Сохраняю..." : "Применить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeOption({
  value,
  current,
  title,
  description,
  onChange,
}: {
  value: SubscriptionActionMode;
  current: SubscriptionActionMode;
  title: string;
  description: string;
  onChange: (value: SubscriptionActionMode) => void;
}) {
  const isActive = value === current;

  return (
    <button
      onClick={() => onChange(value)}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        isActive
          ? "border-violet-400/40 bg-violet-500/15"
          : "border-white/[0.07] bg-white/[0.045] hover:bg-white/[0.07]"
      }`}
    >
      <div className="text-sm font-bold text-slate-100">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
    </button>
  );
}