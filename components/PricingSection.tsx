"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient  } from "@/utils/supabase";

type PlanId = "creator" | "smm_pro";

export function PricingSection() {
  const router = useRouter();
  const supabase = createClient();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  async function handleCheckout(planId: PlanId) {
    try {
      setLoadingPlan(planId);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/robokassa/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка создания платежа");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Не удалось создать оплату. Попробуйте позже.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section id="pricing" className="scroll-mt-8 mt-20">
      <div className="mb-6">
        <h2 className="text-4xl font-black">Тарифы</h2>

        <p className="mt-2 text-gray-400">
          Выберите тариф и подключите больше возможностей для генерации контента.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

          <div className="relative">
            <p className="text-sm text-gray-400">Free</p>
            <h3 className="mt-2 text-3xl font-black">0 ₽</h3>

            <div className="mt-4 space-y-2 text-gray-300">
              <p>• 5 генераций в день</p>
              <p>• История в облаке</p>
              <p>• Базовые стили</p>
            </div>

            <button
              disabled
              className="mt-6 w-full cursor-default rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-gray-300"
            >
              Текущий план
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-cyan-300/40 bg-cyan-300/10 p-6 transition duration-300 hover:-translate-y-2 hover:border-cyan-300/70 hover:shadow-2xl hover:shadow-cyan-300/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
              ПОПУЛЯРНЫЙ
            </div>

            <p className="text-sm text-cyan-200">Creator</p>
            <h3 className="mt-2 text-3xl font-black">299 ₽/мес</h3>

            <div className="mt-4 space-y-2 text-gray-200">
              <p>• 50 генераций в день</p>
              <p>• Все стили</p>
              <p>• Приоритетная генерация</p>
            </div>

            <button
              onClick={() => handleCheckout("creator")}
              disabled={loadingPlan === "creator"}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 py-3 font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loadingPlan === "creator" ? "Создаём оплату..." : "Улучшить план"}
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-violet-300/30 bg-violet-300/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300/60 hover:shadow-2xl hover:shadow-violet-300/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-300/20 opacity-0 blur-3xl transition group-hover:opacity-100" />

          <div className="relative">
            <p className="text-sm text-violet-200">SMM Pro</p>
            <h3 className="mt-2 text-3xl font-black">990 ₽/мес</h3>

            <div className="mt-4 space-y-2 text-gray-300">
              <p>• Безлимит генераций</p>
              <p>• Несколько проектов</p>
              <p>• Командная работа</p>
            </div>

            <button
              onClick={() => handleCheckout("smm_pro")}
              disabled={loadingPlan === "smm_pro"}
              className="mt-6 w-full rounded-2xl border border-violet-300/20 bg-violet-300/10 px-5 py-3 font-bold text-violet-100 transition hover:bg-violet-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "smm_pro" ? "Создаём оплату..." : "Для команды"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}