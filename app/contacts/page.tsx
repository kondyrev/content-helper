import Link from "next/link";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← На главную
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-tight">Контакты</h1>

        <p className="mt-4 text-lg text-gray-400">
          Связаться с нами можно по вопросам работы сервиса, оплаты, доступа к
          тарифам и возвратов.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-4 text-gray-300">
            <p>
              <span className="font-bold text-white">Сервис:</span>{" "}
              КонтентПомощник
            </p>

            <p>
              <span className="font-bold text-white">Сайт:</span>{" "}
              https://content-helper.ru
            </p>

            <p>
              <span className="font-bold text-white">Email:</span>{" "}
              kondyrev@gmail.com
            </p>

            <p>
              <span className="font-bold text-white">Telegram:</span>{" "}
              @kondyrev007
            </p>

            <p>
              <span className="font-bold text-white">Исполнитель:</span>{" "}
              Самозанятый Кондырев Алексей Юрьевич
            </p>

            <p>
              <span className="font-bold text-white">ИНН:</span>{" "}
              504806634483
            </p>

            <p>
              <span className="font-bold text-white">Время ответа:</span>{" "}
              обычно в течение 1 рабочего дня.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}