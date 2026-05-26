"use client";

import { useRouter } from "next/navigation";
import {
  PlanPill,
  RolePill,
  StatusPill,
} from "./UserPills";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type Subscription = {
  user_id: string;
  plan_id: string;
  status: string;
};

type UsersTableProps = {
  users: Profile[];
  subscriptionsMap: Map<string, Subscription>;
};

export function UsersTable({
  users,
  subscriptionsMap,
}: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/[0.07] text-left">
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const subscription = subscriptionsMap.get(user.id);

            return (
              <tr
                key={user.id}
                className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
              >
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xs font-black">
                      {user.email?.slice(0, 2).toUpperCase() || "U"}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-200">
                        {user.email || "Без email"}
                      </div>

                      <div className="mt-1 max-w-[260px] truncate text-xs text-slate-600">
                        {user.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-4">
                  <PlanPill plan={subscription?.plan_id || "free"} />
                </td>

                <td className="px-2 py-4">
                  <RolePill role={user.role} />
                </td>

                <td className="px-2 py-4">
                  <StatusPill status={subscription?.status || "free"} />
                </td>

                <td className="px-2 py-4 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </td>

                <td className="px-2 py-4">
                  <button
                    onClick={() =>
                      router.push(`/admin/users/${user.id}`)
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Открыть
                  </button>
                </td>
              </tr>
            );
          })}

          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-2 py-12 text-center text-sm text-slate-500"
              >
                Пользователи не найдены.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
      {children}
    </th>
  );
}