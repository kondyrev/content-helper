type MenuItem = {
  label: string;
  id: string;
};

type SidebarProps = {
  menuItems: MenuItem[];
  user: unknown;
  todayCount: number;
  dailyLimit: number;
  guestCount: number;
  guestLimit: number;
  onNavigate: (id: string) => void;
  planName: string;
  isAdmin: boolean;
};

export function Sidebar({
  menuItems,
  user,
  todayCount,
  dailyLimit,
  guestCount,
  guestLimit,
  onNavigate,
  planName,
  isAdmin,
}: SidebarProps) {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-black leading-[0.9]">
          <span className="block">Контент</span>

          <span className="block text-violet-400">
            Помощник
          </span>
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          AI SaaS Dashboard
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
              index === 0
                ? "bg-white/10 font-bold"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
        <p className="text-sm text-violet-200">
          {isAdmin ? "Администратор" : planName}
        </p>

        <p className="mt-2 text-3xl font-black">
          {isAdmin
            ? "∞"
            : user
            ? `${todayCount}/${dailyLimit}`
            : `${guestCount}/${guestLimit}`}
        </p>

        <p className="mt-2 text-sm text-gray-300">
          Генераций сегодня
        </p>
      </div>
    </>
  );
}