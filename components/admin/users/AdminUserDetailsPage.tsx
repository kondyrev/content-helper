"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { getAdminOverview } from "@/lib/admin/queries";
import { AdminShell } from "@/components/admin/AdminShell";
import { PlanPill, RolePill, StatusPill } from "./UserPills";

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
};

type Generation = {
  id: string;
  created_at: string;
  topic: string | null;
  platform: string | null;
};

type AccountResponse = {
  profile: Profile;
  profiles: Profile[];
  subscriptions: Subscription[];
};

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const userId = params.userId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserPage() {
      try {
        setPageError(null);

        const accountData =
          (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        const target =
          accountData.profiles.find(
            (profile) => profile.id === userId,
          ) || null;

        const userSubscription =
          accountData.subscriptions.find(
            (item) => item.user_id === userId,
          ) || null;

        setAdminProfile(accountData.profile);
        setTargetProfile(target);
        setSubscription(userSubscription);

        const { data: generationsData } = await supabase
          .from("generations")
          .select("id, created_at, topic, platform")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        setGenerations(generationsData || []);
      } catch (error) {
        console.error(error);

        setPageError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить пользователя.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUserPage();
  }, [router, supabase, userId]);

  const generationCount = useMemo(
    () => generations.length,
    [generations],
  );

  async function handleRoleChange(
    nextRole: "user" | "admin",
  ) {
    if (!targetProfile || !adminProfile) {
      return;
    }

    try {
      setIsUpdatingRole(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Unauthorized");
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
            targetUserId: targetProfile.id,
            nextRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Не удалось обновить роль.",
        );
      }

      setTargetProfile({
        ...targetProfile,
        role: nextRole,
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Ошибка обновления роли.",
      );
    } finally {
      setIsUpdatingRole(false);
    }
  }

  async function handlePlanChange(
    nextPlan: "free" | "creator" | "smm_pro",
  ) {
    if (!targetProfile) {
      return;
    }

    try {
      setIsUpdatingPlan(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Unauthorized");
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
            targetUserId: targetProfile.id,
            newPlanId: nextPlan,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Не удалось сменить тариф.",
        );
      }

      setSubscription({
        user_id: targetProfile.id,
        plan_id: nextPlan,
        status: "active",
        current_period_end:
          nextPlan === "free"
            ? null
            : data.subscription.current_period_end,
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Ошибка смены тарифа.",
      );
    } finally {
      setIsUpdatingPlan(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-[520px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
          <div className="text-xl font-black">
            Ошибка загрузки
          </div>

          <pre className="mt-4 whitespace-pre-wrap text-sm">
            {pageError}
          </pre>
        </div>
      </main>
    );
  }

  if (!targetProfile || !adminProfile) {
    return null;
  }

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                User Details
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.07em]">
                {targetProfile.email || "Без email"}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <RolePill role={targetProfile.role} />

                <PlanPill
                  plan={subscription?.plan_id || "free"}
                />

                <StatusPill
                  status={subscription?.status || "active"}
                />
              </div>

              <div className="mt-6 space-y-2 text-sm text-slate-500">
                <div>User ID: {targetProfile.id}</div>

                <div>
                  Registered:{" "}
                  {new Date(
                    targetProfile.created_at,
                  ).toLocaleDateString("ru-RU")}
                </div>

                <div>
                  Subscription End:{" "}
                  {subscription?.current_period_end
                    ? new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString("ru-RU")
                    : "Без ограничения"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                disabled={
                  isUpdatingRole ||
                  targetProfile.id === adminProfile.id
                }
                onClick={() =>
                  handleRoleChange(
                    targetProfile.role === "admin"
                      ? "user"
                      : "admin",
                  )
                }
                className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingRole
                  ? "Обновление..."
                  : targetProfile.role === "admin"
                    ? "Сделать user"
                    : "Сделать admin"}
              </button>

              <button
                onClick={() =>
                  router.push("/admin/users")
                }
                className="rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.08]"
              >
                Назад
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold">
                  Subscription Actions
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Управление тарифом пользователя
                </div>
              </div>

              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[11px] font-bold text-cyan-100">
                live
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                disabled={isUpdatingPlan}
                onClick={() =>
                  handlePlanChange("free")
                }
                className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-4 transition hover:bg-white/[0.07]"
              >
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-100">
                    Free
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Базовый бесплатный тариф
                  </div>
                </div>

                <PlanPill plan="free" />
              </button>

              <button
                disabled={isUpdatingPlan}
                onClick={() =>
                  handlePlanChange("creator")
                }
                className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-4 transition hover:bg-white/[0.07]"
              >
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-100">
                    Creator
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Creator subscription
                  </div>
                </div>

                <PlanPill plan="creator" />
              </button>

              <button
                disabled={isUpdatingPlan}
                onClick={() =>
                  handlePlanChange("smm_pro")
                }
                className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-4 transition hover:bg-white/[0.07]"
              >
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-100">
                    SMM Pro
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Максимальный тариф
                  </div>
                </div>

                <PlanPill plan="smm_pro" />
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold">
                  Recent Generations
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Последние генерации пользователя
                </div>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-1 text-[11px] font-bold text-slate-300">
                {generationCount}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {generations.map((generation) => (
                <div
                  key={generation.id}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-100">
                        {generation.topic ||
                          "Без темы"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {generation.platform ||
                          "unknown"}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      {new Date(
                        generation.created_at,
                      ).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </div>
              ))}

              {generations.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-6 text-center text-sm text-slate-500">
                  Генераций пока нет
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}