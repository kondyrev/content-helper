import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← На главную
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-tight">
          Возврат и отказ от услуги
        </h1>

        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white">
              Отказ от услуги
            </h2>

            <p className="mt-3">
              Пользователь вправе отказаться от оплаченной услуги до момента
              начала её оказания.
            </p>

            <p className="mt-3">
              После активации доступа к платному тарифу услуга считается
              частично оказанной.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Как запросить возврат
            </h2>

            <p className="mt-3">
              Для оформления возврата необходимо отправить обращение:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>на email: kondyrev@gmail.com</li>
              <li>или через Telegram: @kondyrev007</li>
            </ul>

            <p className="mt-3">
              В обращении необходимо указать:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>email аккаунта;</li>
              <li>дату оплаты;</li>
              <li>причину возврата.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Срок обработки
            </h2>

            <p className="mt-3">
              Заявки на возврат рассматриваются в течение 5 рабочих дней.
            </p>

            <p className="mt-3">
              Возврат денежных средств производится тем же способом, которым
              была произведена оплата.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Дополнительная информация
            </h2>

            <p className="mt-3">
              Возврат денежных средств осуществляется в полном объёме без
              удержания комиссий платёжных систем.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}