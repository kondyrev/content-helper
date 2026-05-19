export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-8 mt-20">
      <div className="mb-6">
        <h2 className="text-4xl font-black">Тарифы</h2>

        <p className="mt-2 text-gray-400">
          Пока это демо-блок. Позже подключим оплату и реальные подписки.
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

            <button className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10">
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

            <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 py-3 font-black text-black transition hover:scale-[1.02]">
              Улучшить план
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

            <button className="mt-6 w-full rounded-2xl border border-violet-300/20 bg-violet-300/10 px-5 py-3 font-bold text-violet-100 transition hover:bg-violet-300/20">
              Для команды
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}