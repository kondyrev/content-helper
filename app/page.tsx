"use client";

const dashboardHref = "/dashboard";

const proofItems = [
  ["1 тема", "достаточно, чтобы получить полное оформление"],
  ["5 блоков", "заголовок, описание, CTA, хештеги, комментарий"],
  ["30 секунд", "быстрее, чем писать описание вручную"],
];

const painItems = [
  [
    "😵‍💫",
    "Нет идей для текста",
    "Видео готово, но непонятно, какой заголовок поставить и что написать в описании.",
  ],
  [
    "⏳",
    "Публикации откладываются",
    "Вы тянете с выкладкой, потому что каждый раз нужно заново придумывать оформление.",
  ],
  [
    "📉",
    "Пост выглядит слабее ролика",
    "Без понятного CTA, первого комментария и хештегов хороший ролик может получить меньше внимания.",
  ],
];

const steps = [
  [
    "1",
    "Введите тему ролика",
    "Например: “показываю, как выбрать музыку для Shorts” или “обзор новой функции в Telegram”.",
  ],
  [
    "2",
    "Выберите площадку и стиль",
    "VK Clips, Shorts, Reels или Telegram. Дружелюбно, экспертно, дерзко или спокойно.",
  ],
  [
    "3",
    "Скопируйте готовое оформление",
    "Заголовок, описание, CTA, хештеги, первый комментарий и идеи для обложки уже готовы.",
  ],
];

const audience = [
  [
    "🎬",
    "Видеокреаторы",
    "Shorts, VK Clips, Reels, YouTube и короткие экспертные ролики.",
  ],
  [
    "📣",
    "Эксперты и фрилансеры",
    "Быстро упаковывайте обучающие, продающие и полезные видео.",
  ],
  [
    "🧠",
    "Те, кто устал придумывать",
    "Когда ролик есть, но заголовок, описание и хештеги не идут в голову.",
  ],
];

const faq = [
  [
    "Нужно ли уметь писать промты?",
    "Нет. Достаточно ввести тему ролика, выбрать площадку и стиль.",
  ],
  [
    "Это только для Shorts?",
    "Нет. Можно использовать для VK Clips, Reels, Telegram и других коротких видеоформатов.",
  ],
  [
    "Можно попробовать бесплатно?",
    "Да. После входа доступен бесплатный тариф с ежедневными генерациями.",
  ],
  [
    "Почему нужно регистрироваться?",
    "Чтобы сохранить историю генераций, лимиты и доступ к тарифам.",
  ],
];

function DashboardButton({
  children,
  variant = "primary",
}: {
  children: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a
      href={dashboardHref}
      className={
        variant === "primary"
          ? "inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-cyan-300 px-6 font-black text-[#041019] shadow-2xl shadow-cyan-300/10 transition hover:-translate-y-0.5"
          : "inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
      }
    >
      {children}
    </a>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070a13] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(167,139,250,0.34),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(103,232,249,0.22),transparent_26%),linear-gradient(180deg,#0a0d1a_0%,#070a13_48%,#050711_100%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070a13]/75 backdrop-blur-xl">
        <div className="relative mx-auto flex h-[74px] max-w-[1180px] items-center justify-between gap-6 px-5">
          <a href={dashboardHref} className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-300 to-cyan-300 shadow-xl shadow-cyan-300/20" />
            <span className="text-xl font-black tracking-tight">
              Контент<span className="text-violet-300">Помощник</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#example" className="transition hover:text-white">
              Пример
            </a>
            <a href="#how" className="transition hover:text-white">
              Как работает
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Тарифы
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <DashboardButton>Попробовать бесплатно</DashboardButton>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-5 py-20 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            ⚡ AI-оформление для Shorts, VK Clips, Reels и Telegram
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.91] tracking-[-0.075em] md:text-7xl">
            Превратите тему видео в{" "}
            <span className="bg-gradient-to-br from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent">
              готовое оформление за 30 секунд
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300">
            КонтентПомощник создаёт заголовок, описание, CTA, хештеги,
            первый комментарий и идеи для обложки — чтобы вы публиковали чаще,
            даже когда нет сил придумывать текст.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <DashboardButton>Сгенерировать бесплатно</DashboardButton>
            
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Без сложных промтов. Введите тему ролика — получите готовый текст
            для публикации.
          </p>

          <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
            {proofItems.map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"
              >
                <b className="mb-1 block text-lg">{title}</b>
                <span className="text-sm leading-snug text-slate-500">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-[34px] border border-white/15 bg-gradient-to-br from-white/15 to-white/5 p-4 shadow-2xl shadow-black/30">
          <div className="absolute -inset-1 -z-10 rounded-[34px] bg-gradient-to-br from-violet-400/40 via-cyan-300/20 to-transparent blur-2xl" />

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            <div className="flex h-12 items-center justify-between border-b border-white/10 bg-white/[0.055] px-5">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
              </div>
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                AI Dashboard
              </span>
            </div>

            <div className="grid gap-4 p-5">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  Тема видео
                </p>
                <p className="text-lg font-bold leading-snug">
                  Показываю, как посадить томаты в теплице и не забыть важные
                  мелочи
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["VK Clips", "дружелюбно", "для новичков"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-violet-300/15 px-3 py-2 text-sm font-semibold text-violet-100"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-violet-300 to-cyan-300 px-5 py-4 text-center font-black text-[#041019]">
                Сгенерировать оформление
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                  Готовый результат
                </p>

                <div className="grid gap-3">
                  {[
                    [
                      "Заголовок",
                      "Как не забыть полить томаты: умные задачи для дачи",
                    ],
                    [
                      "Описание",
                      "Показываю, как запланировать уход за растениями и не держать всё в голове.",
                    ],
                    ["Хештеги", "#дача #томаты #теплица #огород #советы"],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-[#080b16]/50 p-4"
                    >
                      <strong className="mb-1 block text-xs text-cyan-200">
                        {title}
                      </strong>
                      <p className="text-sm leading-relaxed text-slate-200">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="example" className="relative mx-auto max-w-[1180px] px-5 py-18">
        <div className="mb-9 max-w-3xl">
          <h2 className="text-4xl font-black leading-none tracking-tight md:text-5xl">
            Тема ролика → готовая упаковка публикации
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Новый человек должен сразу увидеть ценность: что он вводит и что
            получает на выходе.
          </p>
        </div>

        <div className="rounded-[34px] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.055] p-5 shadow-2xl shadow-black/30">
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-3xl border border-white/10 bg-[#050711]/40 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-black">До генерации</h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                  ручной стопор
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                Как быстро набрать просмотры в Shorts
              </div>

              <ul className="mt-4 grid gap-3 text-slate-300">
                {[
                  "Нет сильного заголовка",
                  "Непонятно, что писать в описание",
                  "Не хочется подбирать хештеги вручную",
                  "Нет понятного призыва к действию",
                ].map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(167,139,250,0.18),transparent_35%),radial-gradient(circle_at_90%_8%,rgba(103,232,249,0.14),transparent_30%),rgba(5,7,17,0.5)] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-black">После генерации</h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-400">
                  готово к публикации
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <ResultPreview
                  wide
                  title="Заголовок"
                  text="5 ошибок в Shorts, из-за которых видео не залетают"
                />
                <ResultPreview
                  title="Описание"
                  text="Разбираем ошибки, которые мешают Shorts набирать просмотры. Подходит для YouTube Shorts, VK Clips и Reels."
                />
                <ResultPreview
                  title="CTA"
                  text="Подпишись, если хочешь больше идей для роста в коротких видео 🚀"
                />
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 md:col-span-2">
                  <p className="mb-2 text-xs font-black text-cyan-200">
                    Хештеги
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["#shorts", "#youtube", "#reels", "#vkclips", "#viralvideo"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingSection
        title="Когда ролик готов, самое сложное — придумать, как его подать"
        text="Многие авторы тратят больше времени на заголовок и описание, чем на саму публикацию. КонтентПомощник убирает этот стопор."
        items={painItems}
      />

      <LandingSection
        id="how"
        title="Как это работает"
        text="Минимум действий. Никаких длинных промтов и сложных настроек."
        items={steps}
      />

      <LandingSection
        title="Для кого это"
        text="Для авторов, которым важно выпускать контент регулярно, а не зависать на каждом описании."
        items={audience}
      />

      <section id="pricing" className="relative mx-auto max-w-[1180px] px-5 py-18">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <h2 className="text-4xl font-black leading-none tracking-tight md:text-5xl">
            Начните бесплатно
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Проверьте на своём ролике, насколько быстрее становится публикация.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl items-center gap-6 rounded-[34px] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.055] p-8 shadow-2xl shadow-black/30 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              Бесплатный старт
            </div>

            <div className="text-5xl font-black tracking-tight">
              0 ₽{" "}
              <span className="text-lg font-medium tracking-normal text-slate-400">
                для первых генераций
              </span>
            </div>

            <ul className="mt-5 grid gap-3 text-slate-300">
              {[
                "Готовые заголовки, описания и хештеги",
                "CTA и первый комментарий",
                "Идеи для обложки ролика",
                "История генераций в личном кабинете",
              ].map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <DashboardButton>Попробовать</DashboardButton>
        </div>
      </section>

      <section id="faq" className="relative mx-auto max-w-[1180px] px-5 py-18">
        <div className="mb-9 max-w-3xl">
          <h2 className="text-4xl font-black leading-none tracking-tight md:text-5xl">
            FAQ
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Коротко о том, что важно перед первым запуском.
          </p>
        </div>

        <div className="grid max-w-4xl gap-3">
          {faq.map(([question, answer]) => (
            <div
              key={question}
              className="rounded-3xl border border-white/15 bg-white/[0.07] p-6"
            >
              <b className="mb-2 block text-lg">{question}</b>
              <p className="leading-relaxed text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1180px] px-5 pb-24 pt-18">
        <div className="rounded-[36px] border border-white/15 bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.25),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(103,232,249,0.22),transparent_28%),rgba(255,255,255,0.075)] px-6 py-16 text-center shadow-2xl shadow-black/30">
          <h2 className="text-4xl font-black leading-none tracking-tight md:text-5xl">
            Попробуйте на теме своего следующего ролика
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Введите одну фразу — получите готовую упаковку публикации. Это
            лучший способ понять ценность сервиса за первые 30 секунд.
          </p>
          <div className="mt-8">
            <DashboardButton>Сгенерировать бесплатно</DashboardButton>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5">
          <p>© КонтентПомощник. AI-оформление видео для creators.</p>

          <div className="flex flex-wrap gap-4">
            <a href="/oferta" className="hover:text-white">
              Оферта
            </a>
            <a href="/privacy" className="hover:text-white">
              Политика конфиденциальности
            </a>
            <a href="/contacts" className="hover:text-white">
              Контакты
            </a>
            <a href="/refund" className="hover:text-white">
              Возврат
            </a>
            <a href="/payment-info" className="hover:text-white">
              Оплата
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ResultPreview({
  title,
  text,
  wide,
}: {
  title: string;
  text: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/10 p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <p className="mb-2 text-xs font-black text-cyan-200">{title}</p>
      <p className="leading-relaxed text-slate-200">{text}</p>
    </div>
  );
}

function LandingSection({
  id,
  title,
  text,
  items,
}: {
  id?: string;
  title: string;
  text: string;
  items: string[][];
}) {
  return (
    <section id={id} className="relative mx-auto max-w-[1180px] px-5 py-18">
      <div className="mb-9 max-w-3xl">
        <h2 className="text-4xl font-black leading-none tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-300">{text}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map(([icon, itemTitle, itemText]) => (
          <div
            key={itemTitle}
            className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-xl shadow-black/10"
          >
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-2xl">
              {icon}
            </div>
            <h3 className="mb-3 text-2xl font-black tracking-tight">
              {itemTitle}
            </h3>
            <p className="leading-relaxed text-slate-300">{itemText}</p>
          </div>
        ))}
      </div>
    </section>
  );
}