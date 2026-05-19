type SettingsSectionProps = {
  user: unknown;
  todayCount: number;
  dailyLimit: number;
  planName: string;
  isAdmin: boolean;
};

export function SettingsSection({
  user,
  todayCount,
  dailyLimit,
  planName,
isAdmin,
}: SettingsSectionProps) {
  return (
    <section
      id="settings"
      className="scroll-mt-8 mt-20 mb-10"
    >
      <div className="mb-6">
        <h2 className="text-4xl font-black">
          Настройки
        </h2>

        <p className="mt-2 text-gray-400">
          Управление аккаунтом и лимитами.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm text-gray-400">
            Аккаунт
          </p>

          <h3 className="mt-2 text-2xl font-black">
            {user ? "Авторизован" : "Гость"}
          </h3>

          <p className="mt-4 text-gray-300">
            {user
              ? "История генераций сохраняется в облаке."
              : "Войдите через Google для синхронизации."}
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
          <p className="text-sm text-cyan-200">
            Лимиты
          </p>

          <h3 className="mt-2 text-2xl font-black">
            {isAdmin ? "∞" : `${todayCount}/${dailyLimit}`}
          </h3>

          <p className="mt-4 text-gray-200">
            Генераций использовано сегодня.
          </p>
        </div>

        <div className="rounded-3xl border border-violet-300/20 bg-violet-300/10 p-6">
          <p className="text-sm text-violet-200">
            Тариф
          </p>

          <h3 className="mt-2 text-2xl font-black">
            {isAdmin ? "Admin" : planName}
          </h3>

          <p className="mt-4 text-gray-200">
            Позже здесь появится управление подпиской.
          </p>
        </div>

        
      </div>
    </section>
  );
}