"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminOverview } from "@/lib/admin/queries";
import { AdminShell } from "@/components/admin/AdminShell";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

type Subscription = {
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  plans: {
    id: string;
    name: string;
    price_month: number;
  } | null;
};

type AccountResponse = {
  profile: Profile;
  profiles: Profile[];
  subscriptions: Subscription[];
};

type PaymentMock = {
  id: string;
  userEmail: string;
  amount: number;
  status: "success" | "failed" | "pending";
  provider: string;
  createdAt: string;
};

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadPayments() {
      try {
        const accountData = (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);
      } catch (error) {
        console.error("Admin payments load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadPayments();
  }, [router]);

  const mockPayments = useMemo<PaymentMock[]>(() => {
    return subscriptions.slice(0, 12).map((subscription, index) => {
      const profile = profiles.find(
        (item) => item.id === subscription.user_id,
      );

      return {
        id: `PAY-${1000 + index}`,
        userEmail: profile?.email || "unknown@email.com",
        amount: subscription.plans?.price_month || 0,
        status:
          index % 5 === 0
            ? "failed"
            : index % 4 === 0
              ? "pending"
              : "success",
        provider: "Robokassa",
        createdAt: new Date(
          Date.now() - index * 86400000,
        ).toISOString(),
      };
    });
  }, [profiles, subscriptions]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return mockPayments.filter((payment) => {
      const matchesSearch =
        !normalizedSearch ||
        payment.userEmail.toLowerCase().includes(normalizedSearch) ||
        payment.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [mockPayments, search, statusFilter]);

  const successfulPayments = mockPayments.filter(
    (item) => item.status === "success",
  );

  const failedPayments = mockPayments.filter(
    (item) => item.status === "failed",
  );

  const pendingPayments = mockPayments.filter(
    (item) => item.status === "pending",
  );

  const revenue = successfulPayments.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-[520px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (!adminProfile) {
    return null;
  }

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                Payments Dashboard
              </div>

              <h1 className="mt-5 text-4xl font-black leading-none tracking-[-0.07em] sm:text-5xl">
                Платежи
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Контроль платежей, webhook событий, failed payments и revenue
                analytics. Сейчас foundation с mock data.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[760px]">
              <MetricCard
                label="Revenue"
                value={`${revenue.toLocaleString("ru-RU")} ₽`}
              />

              <MetricCard
                label="Success"
                value={successfulPayments.length.toString()}
              />

              <MetricCard
                label="Pending"
                value={pendingPayments.length.toString()}
              />

              <MetricCard
                label="Failed"
                value={failedPayments.length.toString()}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <RevenueChart revenue={revenue} />

          <WebhookPanel />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по email или payment id..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
            >
              <option value="all">Все статусы</option>
              <option value="success">success</option>
              <option value="pending">pending</option>
              <option value="failed">failed</option>
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <TableHead>Payment ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                  >
                    <td className="px-2 py-4 text-sm font-bold text-slate-200">
                      {payment.id}
                    </td>

                    <td className="px-2 py-4">
                      <div className="text-sm font-bold text-slate-200">
                        {payment.userEmail}
                      </div>
                    </td>

                    <td className="px-2 py-4 text-sm font-bold text-slate-200">
                      {payment.amount.toLocaleString("ru-RU")} ₽
                    </td>

                    <td className="px-2 py-4">
                      <PaymentStatus status={payment.status} />
                    </td>

                    <td className="px-2 py-4 text-sm text-slate-400">
                      {payment.provider}
                    </td>

                    <td className="px-2 py-4 text-sm text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString("ru-RU")}
                    </td>

                    <td className="px-2 py-4">
                      <button className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]">
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-12 text-center text-sm text-slate-500"
                    >
                      Платежи не найдены.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>

      <div className="mt-1 text-2xl font-black tracking-tight">
        {value}
      </div>
    </div>
  );
}

function RevenueChart({
  revenue,
}: {
  revenue: number;
}) {
  const values = [35, 48, 42, 65, 51, 72, 61, 84, 76, 92];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Revenue Flow</div>

          <div className="mt-1 text-xs text-slate-500">
            Далее подключим реальные payment_events
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right">
          <div className="text-xs text-slate-500">Revenue</div>

          <div className="mt-1 text-lg font-black tracking-tight">
            {revenue.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-72 items-end gap-2 rounded-3xl border border-white/[0.07] bg-black/10 p-4">
        {values.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-full bg-gradient-to-b from-emerald-400 to-cyan-400/40"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </section>
  );
}

function WebhookPanel() {
  const events = [
    "Robokassa success webhook",
    "Pending invoice detected",
    "Payment verification completed",
    "Webhook retry queued",
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Webhook Events</div>

          <div className="mt-1 text-xs text-slate-500">
            Foundation для webhook_logs
          </div>
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
          healthy
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {events.map((event, index) => (
          <div
            key={event}
            className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div>
              <div className="text-sm font-bold text-slate-200">
                {event}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                event #{1000 + index}
              </div>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
              ok
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentStatus({
  status,
}: {
  status: "success" | "failed" | "pending";
}) {
  const className =
    status === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : status === "failed"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
        : "border-amber-300/20 bg-amber-300/10 text-amber-100";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${className}`}
    >
      {status}
    </span>
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