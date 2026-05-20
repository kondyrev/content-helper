"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import { AuthModal } from "@/components/AuthModal";

const features = [
  ["🎬", "VK Клипы", "Описание, хештеги, CTA и первый комментарий под короткие видео."],
  ["✍️", "Telegram", "Посты, анонсы, вовлекающие тексты и идеи подачи."],
  ["⚡", "Shorts", "Короткие формулировки, hooks и упаковка для быстрого просмотра."],
];

const outputBlocks = [
  ["Заголовок", "Как не забыть полить томаты: умные задачи для дачи"],
  ["Описание", "Показываю, как запланировать уход за растениями и не держать всё в голове."],
  ["CTA", "Сохрани, если тоже хочешь порядок в огороде."],
  ["Хештеги", "#дача #огород #томат #умныезадачи"],
  ["Первый комментарий", "А вы уже планируете уход за растениями или всё держите в голове?"],
];

const steps = [
  ["1", "Опиши тему", "Напиши, о чём видео, пост или идея."],
  ["2", "Выбери формат", "VK Клипы, Telegram, Shorts и нужный стиль."],
  ["3", "Получи оформление", "Готовые блоки текста для публикации."],
];

export default function LandingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (response.error) {
      alert(response.error.message);
      return;
    }

    setIsAuthModalOpen(false);
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b16] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,0.35),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.15),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6">
        <header className="mb-16 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div>
            <div className="text-2xl font-black leading-none">
              Контент<span className="text-violet-400">Помощник</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">AI SaaS Dashboard</p>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-full border border-white/10 bg-white px-5 py-2 text-sm font-black text-black transition hover:scale-[1.03]"
          >
            Войти
          </button>
        </header>

        <section className="grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              ✨ AI-оформление для VK, Telegram и Shorts
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Публикуй чаще, даже когда{" "}
              <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-cyan-300 bg-clip-text text-transparent">
                нет сил придумывать текст
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-300">
              КонтентПомощник превращает тему видео в готовое оформление:
              заголовок, описание, хештеги, CTA, первый комментарий и идеи для
              обложки.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => {
                    window.location.href = "/dashboard";
                    }}
                className="rounded-2xl bg-gradient-to-r from-violet-300 to-cyan-300 px-8 py-4 font-black text-black shadow-2xl shadow-cyan-300/10 transition hover:scale-[1.03]"
              >
                Попробовать бесплатно
              </button>

              <a
                href="#example"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Посмотреть пример
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                3 демо-генерации
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                5 генераций после входа
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                История в облаке
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-r from-violet-400/20 to-cyan-300/20 blur-3xl" />

            <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-300/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-300/70" />
                  <div className="h-3 w-3 rounded-full bg-green-300/70" />
                </div>

                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  AI Dashboard
                </span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-gray-400">Тема</p>
                <p className="mt-2 font-bold">
                  Показываю, как посадить томаты в теплице и создать умные задачи.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-gray-400">Площадка</p>
                  <p className="mt-1 font-bold text-cyan-200">VK Клипы</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-gray-400">Стиль</p>
                  <p className="mt-1 font-bold text-violet-200">Дружелюбный</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-300 to-cyan-300 px-5 py-4 text-center font-black text-black">
                Сгенерировать оформление
              </div>

              <div className="mt-5 space-y-3">
                {outputBlocks.slice(0, 3).map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm font-bold text-cyan-200">{title}</p>
                    <p className="mt-1 text-sm text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="text-4xl font-black">Знакомая проблема?</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Видео готово, но название и описание снова откладываются на потом.",
              "Хочется публиковать чаще, но каждый пост отнимает слишком много времени.",
              "Текст получается сухим, а CTA и хештеги приходится дописывать вручную.",
            ].map((text) => (
              <div
                key={text}
                className="rounded-3xl border border-white/10 bg-black/20 p-6 text-gray-300"
              >
                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-8">
            <h2 className="text-4xl font-black">Что умеет сервис</h2>
            <p className="mt-3 text-gray-400">
              Под разные площадки, форматы и стили подачи.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map(([icon, title, text]) => (
              <div
                key={title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07]"
              >
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {steps.map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-300 to-cyan-300 text-xl font-black text-black">
                {number}
              </div>
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-3 text-gray-400">{text}</p>
            </div>
          ))}
        </section>

        <section id="example" className="mt-24 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-4xl font-black">Пример результата</h2>
            <p className="mt-4 text-gray-400">
              На выходе не один абзац, а готовая структура публикации.
            </p>
          </div>

          <div className="grid gap-4">
            {outputBlocks.map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <p className="font-bold text-cyan-200">{title}</p>
                <p className="mt-2 text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-4 md:grid-cols-3">
          {[
            ["Авторам", "Чтобы быстрее выпускать ролики и не застревать на описании."],
            ["SMM-специалистам", "Чтобы упаковывать публикации под разные площадки."],
            ["Экспертам", "Чтобы превращать идеи в понятный контент без мучений."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-violet-300/30"
            >
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 text-gray-400">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-[44px] border border-cyan-300/20 bg-gradient-to-r from-violet-400/10 to-cyan-300/10 p-10 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-black md:text-5xl">
            Начни с бесплатных генераций
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Проверь, как сервис оформит твой контент. Без сложной настройки и
            лишних шагов.
          </p>

          <button
            onClick={() => {
                window.location.href = "/dashboard";
                }}
            className="mt-8 rounded-2xl bg-gradient-to-r from-violet-300 to-cyan-300 px-9 py-4 font-black text-black transition hover:scale-[1.03]"
          >
            Попробовать бесплатно
          </button>
        </section>

        <footer className="mt-16 border-t border-white/10 py-8 text-sm text-gray-500">
          © 2026 КонтентПомощник. AI-инструмент для оформления публикаций.
        </footer>
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