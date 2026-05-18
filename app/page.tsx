"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase";

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

type Toast = {
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
  const [toast, setToast] = useState<Toast | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dailyLimit = 5;
  const guestLimit = 3;

  const limitReached = user
    ? todayCount >= dailyLimit
    : guestCount >= guestLimit;

  const supabase = createClient();
  const resultBlocks = result ? parseResult(result) : [];

  function showToast(message: string, type: ToastType = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  useEffect(() => {
    async function initUser() {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      if (data.user) {
        await loadHistory(data.user.id);
        await loadTodayCount(data.user.id);
      }
    }

    initUser();

    const savedGuestCount = localStorage.getItem("guest-generation-count");

    if (savedGuestCount) {
      setGuestCount(Number(savedGuestCount));
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        loadHistory(session.user.id);
        loadTodayCount(session.user.id);
      } else {
        setHistory([]);
        setTodayCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadTodayCount(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString());

    if (error) {
      console.error(error);
      return;
    }

    setTodayCount(count || 0);
  }

  async function loadHistory(userId: string) {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setHistory(data || []);
  }

  async function saveGenerationToCloud(
    currentTopic: string,
    currentPlatform: string,
    currentStyle: string,
    currentResult: string
  ) {
    if (!user) return;

    const { error } = await supabase.from("generations").insert({
      user_id: user.id,
      topic: currentTopic,
      platform: currentPlatform,
      style: currentStyle,
      result: currentResult,
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadHistory(user.id);
    await loadTodayCount(user.id);
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

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setHistory([]);
    setTodayCount(0);

    showToast("Вы вышли из аккаунта", "info");
  }

  const menuItems = [
    "🏠 Dashboard",
    "✨ Генератор",
    "📜 История",
    "💎 Тарифы",
    "⚙️ Настройки",
  ];

  function SidebarContent() {
    return (
      <>
        <div className="mb-10">
          <h1 className="text-3xl font-black leading-[0.9]">
            <span className="block">Контент</span>

            <span className="block text-violet-400">
              Помощник
            </span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">AI SaaS Dashboard</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={item}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                index === 0
                  ? "bg-white/10 font-bold"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-10 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
          <p className="text-sm text-violet-200">Бесплатный план</p>

          <p className="mt-2 text-3xl font-black">
            {user ? `${todayCount}/${dailyLimit}` : `${guestCount}/${guestLimit}`}
          </p>

          <p className="mt-2 text-sm text-gray-300">Генераций сегодня</p>
        </div>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur ${
            toast.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : toast.type === "error"
              ? "border-red-400/20 bg-red-400/10 text-red-100"
              : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
          }`}
        >
          <p className="font-bold">{toast.message}</p>
        </div>
      )}

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

            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="relative flex min-h-screen">
        <aside className="hidden w-[300px] shrink-0 border-r border-white/10 bg-black/20 p-6 backdrop-blur lg:block">
          <SidebarContent />
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

                  <p className="text-xs text-emerald-300">Аккаунт активен</p>
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
                onClick={loginWithGoogle}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm transition hover:bg-white/10"
              >
                Войти через Google
              </button>
            )}
          </header>

          <section className="mb-10 grid gap-4 md:grid-cols-3">
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
                {user
                  ? `${todayCount}/${dailyLimit}`
                  : `${guestCount}/${guestLimit}`}
              </p>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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

            <div className="rounded-[36px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="space-y-4">
                <textarea
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="min-h-[150px] w-full resize-none rounded-3xl border border-white/10 bg-black/20 p-5 outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <select
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <option>VK Клипы</option>
                    <option>Telegram</option>
                    <option>YouTube Shorts</option>
                  </select>

                  <select
                    value={style}
                    onChange={(event) => setStyle(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <option>Дружелюбный</option>
                    <option>Экспертный</option>
                    <option>Дерзкий</option>
                    <option>Продающий</option>
                    <option>Музыкальный</option>
                  </select>
                </div>

                <button
                  onClick={generateContent}
                  disabled={isLoading || limitReached}
                  className="w-full rounded-3xl bg-gradient-to-r from-violet-300 to-cyan-300 px-7 py-5 font-black text-black transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {limitReached
                    ? user
                      ? "Лимит на сегодня закончился"
                      : "Войдите, чтобы продолжить"
                    : isLoading
                    ? "Генерирую оформление..."
                    : "Сгенерировать оформление"}
                </button>
              </div>
            </div>
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
                  <div
                    key={block.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-cyan-300/30"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-bold text-cyan-200">
                        {block.title}
                      </h3>

                      <button
                        onClick={() => copyText(block.title, block.content)}
                        className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs"
                      >
                        {copiedTitle === block.title ? "Готово" : "Копировать"}
                      </button>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                      {block.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-20">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">История</h2>
                <p className="mt-2 text-gray-400">Последние 10 генераций</p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearCloudHistory}
                  className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-400/20"
                >
                  Очистить
                </button>
              )}
            </div>

            {!user && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
                Войдите через Google для облачной истории.
              </div>
            )}

            {user && history.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
                Пока истории нет.
              </div>
            )}

            {user && history.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openHistoryItem(item)}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
                  >
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                        {item.platform}
                      </span>

                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        {item.style}
                      </span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 text-lg font-bold">
                      {item.topic}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {new Date(item.created_at).toLocaleString("ru-RU")}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}