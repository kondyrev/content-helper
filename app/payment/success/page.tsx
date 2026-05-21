import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-3xl">
          ✓
        </div>

        <h1 className="text-4xl font-black tracking-tight">
          Оплата почти завершена
        </h1>

        <p className="mt-4 text-lg text-gray-400">
          Если платёж успешно подтверждён Robokassa, тариф уже активируется в
          вашем аккаунте.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
          >
            Перейти в кабинет
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}