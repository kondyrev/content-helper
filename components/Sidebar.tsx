type SidebarProps = {
  menuItems: {
    label: string;
    id: string;
  }[];

  user: {
    email?: string;
  } | null;

  todayCount: number;
  dailyLimit: number;

  onNavigate: (id: string) => void;

  planName: string;

  isAdmin: boolean;

  subscriptionEnd: string | null;
};

export function Sidebar({
  menuItems,
  user,
  todayCount,
  dailyLimit,
  onNavigate,
  planName,
  isAdmin,
  subscriptionEnd,
}: SidebarProps) {
  const usagePercent = Math.min(
    (todayCount / Math.max(dailyLimit, 1)) * 100,
    100
  );

  return (
    <div className="flex h-full flex-col">
      <div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div>
            <h1 className="text-3xl font-black leading-none">
              Контент
              <br />
              Помощник
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              AI SaaS Dashboard
            </p>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Текущий тариф
              </p>

              <h3 className="mt-1 text-xl font-black">
                {isAdmin ? "Admin" : planName}
              </h3>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-violet-300 to-cyan-300 px-3 py-2 text-sm font-black text-black">
              {isAdmin ? "∞" : `${todayCount}/${dailyLimit}`}
            </div>
          </div>

          {!isAdmin && (
            <>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-300 to-cyan-300 transition-all duration-500"
                  style={{
                    width: `${usagePercent}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Генераций сегодня</span>

                <span>
                  {todayCount} / {dailyLimit}
                </span>
              </div>

              {subscriptionEnd && (
                <p className="mt-3 text-xs text-violet-200">
                  Подписка до{" "}
                  {new Date(subscriptionEnd).toLocaleDateString(
                    "ru-RU"
                  )}
                </p>
              )}
            </>
          )}

          {user?.email && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="truncate text-sm text-gray-300">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}