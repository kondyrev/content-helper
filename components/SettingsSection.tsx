type SettingsSectionProps = {
  user: {
    email?: string;
  } | null;

  todayCount: number;
  dailyLimit: number;
  planName: string;
  isAdmin: boolean;
  subscriptionEnd: string | null;
};

export function SettingsSection({
  user,
  todayCount,
  dailyLimit,
  planName,
  isAdmin,
  subscriptionEnd,
}: SettingsSectionProps) {
  return (
    <section id="settings" className="scroll-mt-8 mt-20">
      <div className="mb-6">
        <h2 className="text-4xl font-black">Настройки</h2>

        <p className="mt-2 text-gray-400">
          Информация об аккаунте, тарифе и лимитах.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Аккаунт</p>

          <h3 className="mt-2 text-xl font-black">
            {user?.email || "Не авторизован"}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            {user
              ? "Вы вошли в аккаунт. История и лимиты сохраняются в облаке."
              : "Войдите, чтобы использовать генератор."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Тариф</p>

          <h3 className="mt-2 text-xl font-black">
            {isAdmin ? "Admin" : planName}
          </h3>

          <p className="mt-3 text-sm text-gray-400">
            {isAdmin
              ? "Администраторский доступ без ограничений."
              : subscriptionEnd
                ? `Подписка активна до ${new Date(
                    subscriptionEnd
                  ).toLocaleDateString("ru-RU")}`
                : "Бесплатный тариф"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Использование сегодня</p>

          <h3 className="mt-2 text-xl font-black">
            {isAdmin ? "∞" : `${todayCount}/${dailyLimit}`}
          </h3>

          {!isAdmin && (
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-300 to-cyan-300 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (todayCount / Math.max(dailyLimit, 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Управление подпиской</p>

          <h3 className="mt-2 text-xl font-black">Robokassa</h3>

          <p className="mt-3 text-sm text-gray-400">
            Оплата и продление тарифа доступны в разделе “Тарифы”.
          </p>
        </div>
      </div>
    </section>
  );
}