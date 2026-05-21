export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#070b16] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">
          Политика конфиденциальности
        </h1>

        <p className="mt-6 text-gray-400">
          Настоящая политика описывает порядок обработки персональных данных
          пользователей сервиса «КонтентПомощник».
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-black">
              1. Какие данные собираются
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Сервис может хранить email пользователя, данные авторизации,
              историю генераций и техническую информацию, необходимую для работы
              платформы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              2. Цель обработки данных
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Данные используются исключительно для предоставления доступа к
              функционалу сервиса и улучшения качества работы платформы.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              3. Передача данных
            </h2>

            <p className="mt-4 leading-8 text-gray-300">
              Сервис не передаёт персональные данные третьим лицам, за
              исключением случаев, предусмотренных законодательством.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              4. Контакты
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