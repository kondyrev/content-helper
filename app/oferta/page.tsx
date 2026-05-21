export default function OfertaPage() {
  return (
    <main className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">Публичная оферта</h1>

        <p className="mt-6 text-gray-400">
          Настоящий документ является публичной офертой на предоставление
          доступа к сервису «КонтентПомощник».
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-black">
              1. Предмет соглашения
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Сервис «КонтентПомощник» предоставляет пользователю доступ к
              AI-инструментам генерации контента для социальных сетей,
              публикаций, видео и маркетинговых материалов.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              2. Описание услуги
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Пользователь получает доступ к функционалу генерации текстов,
              описаний, заголовков, CTA, хештегов и других материалов в рамках
              выбранного тарифа.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              3. Стоимость и оплата
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Стоимость тарифов указывается на сайте сервиса. Оплата
              осуществляется через подключённые платёжные системы.
            </p>

            <p className="mt-4 leading-8 text-gray-300">
              После подтверждения оплаты доступ к соответствующему тарифу
              активируется автоматически.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              4. Возврат средств
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Пользователь вправе обратиться с запросом на возврат средств в
              течение 7 календарных дней с момента оплаты, если услуга не была
              фактически использована.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              5. Ответственность сторон
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Сервис предоставляется по модели «как есть». Администрация сервиса
              не несёт ответственности за возможные убытки, связанные с
              использованием результатов генерации.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              6. Контакты
            </h2>

            <div className="mt-4 space-y-2 text-gray-300">
              <p>Email: a.kondyrev@yandex.ru</p>
              <p>Сайт: https://content-helper.ru</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}