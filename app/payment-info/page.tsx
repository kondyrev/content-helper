import Link from "next/link";

export default function PaymentInfoPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← На главную
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-tight">
          Информация об оплате и оказании услуг
        </h1>

        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white">
              Описание сервиса
            </h2>

            <p className="mt-3">
              КонтентПомощник — онлайн SaaS-сервис для генерации контента с
              использованием AI.
            </p>

            <p className="mt-3">
              Пользователи могут получать идеи, заголовки, описания, SEO-тексты,
              комментарии, хештеги и другой контент для социальных сетей и
              видеоплатформ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Тарифы и стоимость
            </h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-bold text-white">Free — 0 ₽</p>

                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>5 генераций в день</li>
                  <li>Базовые возможности сервиса</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="font-bold text-white">Creator — 299 ₽</p>

                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>50 генераций в день</li>
                  <li>Все стили генерации</li>
                  <li>Приоритетная обработка запросов</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
                <p className="font-bold text-white">SMM Pro — 990 ₽</p>

                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Безлимит генераций</li>
                  <li>Расширенные возможности сервиса</li>
                  <li>Работа с несколькими проектами</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Порядок оказания услуги
            </h2>

            <p className="mt-3">
              После успешной оплаты тариф активируется автоматически в аккаунте
              пользователя.
            </p>

            <p className="mt-3">
              Доступ к платным возможностям предоставляется через личный кабинет
              сервиса.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Способы оплаты
            </h2>

            <p className="mt-3">
              Оплата осуществляется через платёжный сервис Robokassa.
            </p>

            <p className="mt-3">
              Доступные способы оплаты зависят от возможностей платёжной
              системы.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}