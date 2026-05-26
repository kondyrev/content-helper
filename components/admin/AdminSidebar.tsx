type AdminNavGroupProps = {
  label: string;
  items: [string, string, string][];
};

export function AdminSidebar() {
  return (
    <aside className="hidden h-screen border-r border-white/10 bg-[#070812]/75 px-4 py-5 backdrop-blur-2xl lg:sticky lg:top-0 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 font-black shadow-[0_18px_40px_rgba(139,92,246,0.3)]">
          КП
        </div>

        <div>
          <div className="text-sm font-bold tracking-tight">
            КонтентПомощник
          </div>
          <div className="text-xs text-slate-500">Admin Control Center</div>
        </div>
      </div>

      <nav className="space-y-7">
        <AdminNavGroup
          label="Главное"
          items={[
            ["⌘", "Overview", "/admin"],
            ["◎", "Analytics", "/admin/analytics"],
            ["◌", "Activity", "/admin/audit"],
          ]}
        />

        <AdminNavGroup
          label="Управление"
          items={[
            ["◍", "Users", "/admin/users"],
            ["◐", "Payments", "/admin/payments"],
            ["◒", "Subscriptions", "/admin/subscriptions"],
            ["✦", "Support", "/admin/support"],
          ]}
        />

        <AdminNavGroup
          label="Контент"
          items={[
            ["✎", "Landing CMS", "/admin/cms"],
            ["◇", "SEO", "/admin/cms/seo"],
            ["☰", "Pricing", "/admin/cms/pricing"],
          ]}
        />
      </nav>

      <div className="absolute bottom-5 left-4 right-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl">
        <div className="text-sm font-bold">Production mode</div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          content-helper.ru работает стабильно. Админка доступна только роли
          admin.
        </p>
      </div>
    </aside>
  );
}

function AdminNavGroup({ label, items }: AdminNavGroupProps) {
  return (
    <div>
      <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="space-y-1">
        {items.map(([icon, title, href]) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <span className="grid h-5 w-5 place-items-center text-slate-400">
              {icon}
            </span>
            {title}
          </a>
        ))}
      </div>
    </div>
  );
}