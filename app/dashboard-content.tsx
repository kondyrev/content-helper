"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase";
import { Sidebar } from "@/components/Sidebar";
import { ResultCard } from "@/components/ResultCard";
import { Toast } from "@/components/Toast";
import { HistorySection } from "@/components/HistorySection";
import { GeneratorForm } from "@/components/GeneratorForm";
import { PricingSection } from "@/components/PricingSection";
import { SettingsSection } from "@/components/SettingsSection";
import { AdminSection } from "@/components/AdminSection";
import { AuthModal } from "@/components/AuthModal";
import { updateUserRole, updateUserPlan } from "@/lib/account";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type Plan = {
  id: "free" | "creator" | "smm_pro";
  name: string;
  daily_limit: number;
  price_month: number;
  created_at?: string;
};

type AdminProfile = Profile;

type AdminSubscription = {
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

type ResultBlock = {
  title: string;
  content: string;
};

type HistoryItem = {
  id: string;
  user_id?: string;
  topic: string;
  platform: string;
  style: string;
  result: string;
  created_at: string;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
};

type AccountResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: Profile;
  subscription: {
    user_id: string;
    plan_id: string;
    status: string;
    current_period_end: string | null;
  };
  plan: Plan;
  history: HistoryItem[];
  historyLimit: number;
  todayCount: number;
  profiles: AdminProfile[];
  subscriptions: AdminSubscription[];
};

function parseResult(text: string): ResultBlock[] {
  const blocks = text
    .trim()
    .split(/\n\s*(?=\d+\.\s)/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const firstLine = lines[0];
    const titleMatch = firstLine.match(/^\d+\.\s*(.*?):\s*(.*)$/);

    if (!titleMatch) {
      return {
        title: "Результат",
        content: block,
      };
    }

    const title = titleMatch[1].trim();
    const firstContent = titleMatch[2].trim();
    const otherContent = lines.slice(1).join("\n").trim();

    return {
      title,
      content: [firstContent, otherContent].filter(Boolean).join("\n"),
    };
  });
}

function toUser(accountUser: AccountResponse["user"]): User {
  return {
    id: accountUser.id,
    email: accountUser.email || undefined,
  } as User;
}

export default function Home() {
  const [topic, setTopic] = useState(
    "Показываю, как посадить томаты в теплице и создать умные задачи для ухода."
  );

  const [platform, setPlatform] = useState("VK Клипы");
  const [style, setStyle] = useState("Дружелюбный");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const dailyLimit = currentPlan?.daily_limit ?? 5;
  const isAdmin = profile?.role === "admin";

  const limitReached = Boolean(
    user && !isAdmin && !isAccountLoading && todayCount >= dailyLimit
  );

  const resultBlocks = result ? parseResult(result) : [];

  function showToast(message: string, type: ToastType = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  function resetUserState() {
    setUser(null);
    setHistory([]);
    setHistoryLimit(10);
    setTodayCount(0);
    setProfile(null);
    setCurrentPlan(null);
    setSubscriptionEnd(null);
    setProfiles([]);
    setSubscriptions([]);
    setIsAccountLoading(false);
    setResult("");
  }

  function applyAccountData(account: AccountResponse) {
    setUser(toUser(account.user));
    setProfile(account.profile);
    setCurrentPlan(account.plan);
    setSubscriptionEnd(account.subscription?.current_period_end || null);
    setHistory(account.history || []);
    setHistoryLimit(account.historyLimit || 10);
    setTodayCount(account.todayCount || 0);
    setProfiles(account.profiles || []);
    setSubscriptions(account.subscriptions || []);
  }

  async function loadAccount(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setIsAccountLoading(true);
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        resetUserState();
        return;
      }

      const response = await fetch("/api/account/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account load failed");
      }

      applyAccountData(data as AccountResponse);
    } catch (error) {
      console.error("Account load error:", error);

      if (!options?.silent) {
        showToast(
          "Не удалось загрузить аккаунт. Проверьте соединение и попробуйте ещё раз.",
          "error"
        );
      }
    } finally {
      setIsAccountLoading(false);
    }
  }

  useEffect(() => {
    void loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        resetUserState();
        return;
      }

      if (session?.access_token) {
        window.setTimeout(() => {
          void loadAccount({ silent: event === "TOKEN_REFRESHED" });
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function generateContent() {
    if (!user) {
      setIsAuthModalOpen(true);
      showToast("Войдите в аккаунт, чтобы сгенерировать контент", "info");
      return;
    }

    if (isAccountLoading) {
      showToast("Аккаунт ещё загружается. Подождите пару секунд.", "info");
      return;
    }

    if (limitReached) {
      showToast("Дневной лимит генераций закончился", "error");
      return;
    }

    try {
      setIsLoading(true);
      setResult("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setIsAuthModalOpen(true);
        showToast("Сессия не найдена. Войдите ещё раз.", "error");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          topic,
          platform,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(data.error || "Ошибка генерации");
        showToast(data.error || "Ошибка генерации", "error");

        if (typeof data.usedToday === "number") {
          setTodayCount(data.usedToday);
        }

        if (typeof data.subscriptionEnd !== "undefined") {
          setSubscriptionEnd(data.subscriptionEnd);
        }

        return;
      }

      setResult(data.result);

      if (typeof data.usedToday === "number") {
        setTodayCount(data.usedToday);
      }

      if (typeof data.subscriptionEnd !== "undefined") {
        setSubscriptionEnd(data.subscriptionEnd);
      }

      await loadAccount({ silent: true });

      showToast("Контент успешно сгенерирован", "success");
    } catch (error) {
      console.error(error);
      showToast("Ошибка соединения", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyText(title: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedTitle(title);

    setTimeout(() => {
      setCopiedTitle("");
    }, 1500);

    showToast(`Скопировано: ${title}`, "info");
  }

  function downloadTxt() {
    if (!result) return;

    const fileContent = `
КонтентПомощник

Тема:
${topic}

Площадка:
${platform}

Стиль:
${style}

Результат:
${result}
`;

    const blob = new Blob([fileContent], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "content-helper-result.txt";
    link.click();

    URL.revokeObjectURL(url);

    showToast("TXT файл скачан", "success");
  }

  function openHistoryItem(item: HistoryItem) {
    setTopic(item.topic);
    setPlatform(item.platform);
    setStyle(item.style);
    setResult(item.result);
    setIsMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    showToast("Генерация открыта", "info");
  }

  async function clearCloudHistory() {
    if (!user) return;

    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      showToast("Ошибка очистки", "error");
      return;
    }

    setHistory([]);
    setTodayCount(0);
    showToast("История очищена", "success");
  }


  async function deleteHistoryItems(ids: string[]) {
  if (!user || ids.length === 0) return;

  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    console.error(error);
    showToast("Ошибка удаления", "error");
    return;
  }

  setHistory((current) => current.filter((item) => !ids.includes(item.id)));

  showToast(
    ids.length === 1 ? "Запись удалена" : "Выбранные записи удалены",
    "success"
  );
}


  async function changeUserRole(userId: string, role: "user" | "admin") {
    try {
      await updateUserRole(supabase, userId, role);
      await loadAccount({ silent: true });

      showToast(
        role === "admin"
          ? "Пользователь стал администратором"
          : "Права администратора сняты",
        "success"
      );
    } catch (error) {
      console.error(error);
      showToast("Не удалось изменить роль", "error");
    }
  }

  async function changeUserPlan(
    userId: string,
    planId: "free" | "creator" | "smm_pro"
  ) {
    try {
      await updateUserPlan(supabase, userId, planId);
      await loadAccount({ silent: true });

      showToast("Тариф пользователя обновлён", "success");
    } catch (error) {
      console.error(error);
      showToast("Не удалось изменить тариф", "error");
    }
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://content-helper.ru/dashboard",
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Google login error:", error);
      showToast("Не удалось войти через Google", "error");
    }
  }

  async function loginWithEmail(
    email: string,
    password: string,
    mode: "login" | "register"
  ) {
    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
          });

    if (response.error) {
      showToast(response.error.message, "error");
      return;
    }

    setIsAuthModalOpen(false);

    showToast(
      mode === "login"
        ? "Вы вошли в аккаунт"
        : "Аккаунт создан. Проверьте почту.",
      "success"
    );

    await loadAccount();
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Ошибка выхода:", error);
        showToast("Не удалось выйти из аккаунта", "error");
        return;
      }

      resetUserState();
      showToast("Вы вышли из аккаунта", "info");
    } catch (error) {
      console.error("Ошибка выхода:", error);
      showToast("Не удалось выйти из аккаунта", "error");
    }
  }

  const menuItems = [
    { label: "🏠 Dashboard", id: "dashboard" },
    { label: "✨ Генератор", id: "generator" },
    { label: "📜 История", id: "history" },
    { label: "💎 Тарифы", id: "pricing" },
    { label: "⚙️ Настройки", id: "settings" },
    { label: "🎧 Поддержка", id: "support" },
    ...(isAdmin ? [{ label: "🛠️ Админка", id: "admin" }] : []),
  ];

  function scrollToSection(id: string) {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsMobileMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <Toast toast={toast} />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.28),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%)]" />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Закрыть меню"
          />

          <aside className="relative h-full w-[82%] max-w-[320px] border-r border-white/10 bg-[#070b16] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-bold text-gray-300">Меню</p>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xl"
              >
                ×
              </button>
            </div>

            <Sidebar
              menuItems={menuItems}
              user={user}
              todayCount={todayCount}
              dailyLimit={dailyLimit}
              onNavigate={scrollToSection}
              planName={currentPlan?.name || "Free"}
              isAdmin={isAdmin}
              subscriptionEnd={subscriptionEnd}
            />
          </aside>
        </div>
      )}

      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-white/10 bg-black/20 p-6 backdrop-blur lg:block">
          <Sidebar
            menuItems={menuItems}
            user={user}
            todayCount={todayCount}
            dailyLimit={dailyLimit}
            onNavigate={scrollToSection}
            planName={currentPlan?.name || "Free"}
            isAdmin={isAdmin}
            subscriptionEnd={subscriptionEnd}
          />
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 lg:hidden"
              >
                ☰
              </button>

              <div>
                <h2 className="text-2xl font-black">Dashboard</h2>
                <p className="text-sm text-gray-400">
                  Управление AI-контентом
                </p>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="max-w-[220px] truncate text-sm font-bold text-gray-200">
                    {user.email}
                  </p>

                  <p className="text-xs text-emerald-300">
                    {isAccountLoading
                      ? "Загрузка аккаунта..."
                      : profile?.role === "admin"
                        ? "Администратор"
                        : currentPlan
                          ? `Тариф: ${currentPlan.name}`
                          : "Аккаунт активен"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-300 to-cyan-300 font-black text-black">
                  {user.email?.slice(0, 1).toUpperCase() || "U"}
                </div>

                <button
                  onClick={logout}
                  className="rounded-full border border-white/10 px-5 py-2 text-sm transition hover:bg-white/10"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm transition hover:bg-white/10"
              >
                Войти
              </button>
            )}
          </header>

          <section
            id="dashboard"
            className="scroll-mt-8 mb-10 grid gap-4 md:grid-cols-3"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-gray-400">Статус</p>
              <p className="mt-2 text-2xl font-black">
                {isAccountLoading
                  ? "Загрузка"
                  : user
                    ? "В облаке"
                    : "Вход нужен"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-gray-400">История</p>
              <p className="mt-2 text-2xl font-black">
                {isAccountLoading ? "..." : `${history.length}/${historyLimit}`}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-gray-400">Лимит</p>
              <p className="mt-2 text-2xl font-black">
                {isAccountLoading
                  ? "..."
                  : isAdmin
                    ? "∞"
                    : user
                      ? `${todayCount}/${dailyLimit}`
                      : "Войдите"}
              </p>
            </div>
          </section>

          <section id="generator" className="scroll-mt-8">
            <GeneratorForm
              topic={topic}
              platform={platform}
              style={style}
              isLoading={isLoading}
              limitReached={limitReached}
              user={user}
              onTopicChange={setTopic}
              onPlatformChange={setPlatform}
              onStyleChange={setStyle}
              onGenerate={generateContent}
            />
          </section>

          <section className="mt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl font-black">Результат</h2>

              {result && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadTxt}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    Скачать .txt
                  </button>

                  <button
                    onClick={() => copyText("Весь результат", result)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
                  >
                    Скопировать всё
                  </button>
                </div>
              )}
            </div>

            {!result && !isLoading && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
                Здесь появится готовое оформление.
              </div>
            )}

            {isLoading && (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="mb-4 h-6 w-1/2 rounded-full bg-white/10" />
                    <div className="space-y-3">
                      <div className="h-4 rounded-full bg-white/10" />
                      <div className="h-4 w-5/6 rounded-full bg-white/10" />
                      <div className="h-4 w-2/3 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && result && resultBlocks.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {resultBlocks.map((block) => (
                  <ResultCard
                    key={block.title}
                    title={block.title}
                    content={block.content}
                    copiedTitle={copiedTitle}
                    onCopy={copyText}
                  />
                ))}
              </div>
            )}

            


          </section>

          <HistorySection
            history={history}
            onClear={clearCloudHistory}
            onOpenItem={openHistoryItem}
            onDeleteItems={deleteHistoryItems}
          />

          <PricingSection
            currentPlan={currentPlan?.id}
            onAuthRequired={() => setIsAuthModalOpen(true)}
          />

          <SettingsSection
            user={user}
            todayCount={todayCount}
            dailyLimit={dailyLimit}
            planName={currentPlan?.name || "Free"}
            isAdmin={isAdmin}
            subscriptionEnd={subscriptionEnd}
          />

          <AdminSection
            isAdmin={isAdmin}
            profiles={profiles}
            subscriptions={subscriptions}
            onChangeRole={changeUserRole}
            onChangePlan={changeUserPlan}
          />

          <footer className="mt-16 border-t border-white/10 py-8 text-sm text-gray-500">
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <a href="/oferta" className="transition hover:text-white">
                Оферта
              </a>

              <a href="/privacy" className="transition hover:text-white">
                Политика конфиденциальности
              </a>

              <a href="/contacts" className="transition hover:text-white">
                Контакты
              </a>

              <a href="/refund" className="transition hover:text-white">
                Условия возврата
              </a>

              <a href="/payment-info" className="transition hover:text-white">
                Информация об оплате и оказании услуг
              </a>
            </div>

            <p className="mt-4">
              © 2026 КонтентПомощник. AI-инструмент для оформления публикаций.
            </p>
          </footer>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleLogin={loginWithGoogle}
        onEmailAuth={loginWithEmail}
      />
    </main>
  );
}