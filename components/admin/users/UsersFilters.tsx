type UsersFiltersProps = {
  search: string;
  roleFilter: string;
  planFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPlanChange: (value: string) => void;
};

export function UsersFilters({
  search,
  roleFilter,
  planFilter,
  onSearchChange,
  onRoleChange,
  onPlanChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500">
        <span>⌕</span>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск по email или user id..."
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={roleFilter}
          onChange={(event) => onRoleChange(event.target.value)}
          className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
        >
          <option value="all">Все роли</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <select
          value={planFilter}
          onChange={(event) => onPlanChange(event.target.value)}
          className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
        >
          <option value="all">Все тарифы</option>
          <option value="free">free</option>
          <option value="creator">creator</option>
          <option value="smm_pro">smm_pro</option>
        </select>
      </div>
    </div>
  );
}