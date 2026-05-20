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
import {
  ensureUserAccount,
  loadHistory as loadHistoryFromCloud,
  loadTodayCount as loadTodayCountFromCloud,
  saveGenerationToCloud as saveGenerationToCloudToCloud,
  loadProfiles,
  updateUserRole,
  type Profile,
  type Plan,
  loadSubscriptions,
  updateUserPlan,

} from "@/lib/account";

type AdminProfile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type AdminSubscription = {
  user_id: string;
  plan_id: string;
  status: string;
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

export default function Home() {
  const [topic, setTopic] = useState(
    "Показываю, как посадить томаты в теплице и создать умные задачи для ухода."
  );

  const [platform, setPlatform] = useState("VK Клипы");
  const [style, setStyle] = useState("Дружелюбный");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const guestLimit = 3;
  const dailyLimit = currentPlan?.daily_limit ?? 5;
  const isAdmin = profile?.role === "admin";

  const limitReached = isAdmin
    ? false
    : user
    ? todayCount >= dailyLimit
    : guestCount >= guestLimit;

  const resultBlocks = result ? parseResult(result) : [];

  function showToast(message: string, type: ToastType = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  async function handleAuthenticatedUser(currentUser: User) {
  try {
    setUser(currentUser);

    const account = await ensureUserAccount(supabase, currentUser);

    setProfile(account.profile);
    setCurrentPlan(account.plan);

    const historyData = await loadHistoryFromCloud(supabase, currentUser.id);
    const count = await loadTodayCountFromCloud(supabase, currentUser.id);

    setHistory(historyData as HistoryItem[]);
    setTodayCount(count);

    if (account.profile.role === "admin") {
  const profilesData = await loadProfiles(supabase);
  const subscriptionsData = await loadSubscriptions(supabase);

  setProfiles(profilesData as AdminProfile[]);
  setSubscriptions(subscriptionsData as unknown as AdminSubscription[]);
      } else {
        setProfiles([]);
        setSubscriptions([]);
      }
  } catch (error) {
    console.error("Ошибка авторизации/профиля:", error);

    resetUserState();

    showToast(
      "Не удалось загрузить профиль пользователя. Проверь Supabase/RLS.",
      "error"
    );
  }
}

  function resetUserState() {
    setUser(null);
    setHistory([]);
    setTodayCount(0);
    setProfile(null);
    setCurrentPlan(null);
    setProfiles([]);
    setSubscriptions([]);
  }

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("code")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedGuestCount = localStorage.getItem("guest-generation-count");

    if (savedGuestCount) {
      setGuestCount(Number(savedGuestCount));
    }

    async function initUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        await handleAuthenticatedUser(data.user);
      }
    }

    initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setTimeout(() => {
          handleAuthenticatedUser(session.user);
        }, 0);
      } else {
        resetUserState();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
  async function refreshAccount() {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      await handleAuthenticatedUser(data.user);
    }
  }

  window.addEventListener("focus", refreshAccount);

  return () => {
    window.removeEventListener("focus", refreshAccount);
  };
}, [supabase]);

  async function loadTodayCount(userId: string) {
    try {
      const count = await loadTodayCountFromCloud(supabase, userId);
      setTodayCount(count);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHistory(userId: string) {
    try {
      const data = await loadHistoryFromCloud(supabase, userId);
      setHistory(data as HistoryItem[]);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveGenerationToCloud(
    currentTopic: string,
    currentPlatform: string,
    currentStyle: string,
    currentResult: string
  ) {
    if (!user) return;

    try {
      await saveGenerationToCloudToCloud(
        supabase,
        user.id,
        currentTopic,
        currentPlatform,
        currentStyle,
        currentResult
      );

      await loadHistory(user.id);
      await loadTodayCount(user.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function generateContent() {
    if (limitReached) {
      showToast(
        user
          ? "Дневной лимит генераций закончился"
          : "Войдите через Google для продолжения",
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);
      setResult("");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        showToast("Ошибка генерации", "error");
        return;
      }

      setResult(data.result);

      if (!user) {
        const newGuestCount = guestCount + 1;
        setGuestCount(newGuestCount);
        localStorage.setItem("guest-generation-count", String(newGuestCount));
      }

      await saveGenerationToCloud(topic, platform, style, data.result);

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
    showToast("История очищена", "success");
  }

  async function changeUserRole(
  userId: string,
  role: "user" | "admin"
) {
  try {
    await updateUserRole(supabase, userId, role);

    const updatedProfiles = await loadProfiles(supabase);

    setProfiles(updatedProfiles as AdminProfile[]);

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

    const updatedSubscriptions = await loadSubscriptions(supabase);

    setSubscriptions(updatedSubscriptions as unknown as AdminSubscription[]);

    showToast("Тариф пользователя обновлён", "success");
  } catch (error) {
    console.error(error);
    showToast("Не удалось изменить тариф", "error");
  }
}

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
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

  showToast(
    mode === "login"
      ? "Вы вошли в аккаунт"
      : "Аккаунт создан. Проверьте почту.",
    "success"
  );

  setIsAuthModalOpen(false);
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

      setTimeout(() => {
        window.location.replace("/");
      }, 300);
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
              guestCount={guestCount}
              guestLimit={guestLimit}
              onNavigate={scrollToSection}
              planName={currentPlan?.name || "Free"}
              isAdmin={isAdmin}
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
            guestCount={guestCount}
            guestLimit={guestLimit}
            onNavigate={scrollToSection}
            planName={currentPlan?.name || "Free"}
            isAdmin={isAdmin}
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
                <p className="text-sm text-gray-400">Управление AI-контентом</p>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="max-w-[220px] truncate text-sm font-bold text-gray-200">
                    {user.email}
                  </p>

                  <p className="text-xs text-emerald-300">
                    {profile?.role === "admin"
                      ? "Администратор"
                      : currentPlan
                      ? `Тариф: ${currentPlan.name}`
                      : "Аккаунт активен"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-300 to-cyan-300 font-black text-black">
                  {user.email?.slice(0, 1).toUpperCase()}
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
                {user ? "В облаке" : "Гость"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-gray-400">История</p>
              <p className="mt-2 text-2xl font-black">{history.length}/10</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-gray-400">Лимит</p>
              <p className="mt-2 text-2xl font-black">
                {isAdmin
                  ? "∞"
                  : user
                  ? `${todayCount}/${dailyLimit}`
                  : `${guestCount}/${guestLimit}`}
              </p>
            </div>
          </section>

          <section
            id="generator"
            className="scroll-mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="mb-6 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-200">
                AI Dashboard
              </div>

              <h1 className="mb-6 text-4xl font-black leading-tight md:text-5xl">
                Создавай контент быстрее
              </h1>

              <p className="text-lg leading-relaxed text-gray-300">
                Генерируй описания, хештеги, CTA и идеи для публикаций в VK,
                Telegram и Shorts.
              </p>
            </div>

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

          <HistorySection history={history} onClear={clearCloudHistory} />

          <PricingSection />

          <SettingsSection
            user={user}
            todayCount={todayCount}
            dailyLimit={dailyLimit}
            planName={currentPlan?.name || "Free"}
            isAdmin={isAdmin}
          />

          <AdminSection
            isAdmin={isAdmin}
            profiles={profiles}
            subscriptions={subscriptions}
            onChangeRole={changeUserRole}
            onChangePlan={changeUserPlan}
          />
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