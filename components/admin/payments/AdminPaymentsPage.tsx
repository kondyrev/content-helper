"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminOverview } from "@/lib/admin/queries";
import {
  AdminPayment,
  getAdminPayments,
  getFailedPayments,
  getPaymentsRevenue,
  getPendingPayments,
  getSuccessfulPayments,
} from "@/lib/admin/payments";
import { AdminShell } from "@/components/admin/AdminShell";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

type AccountResponse = {
  profile: Profile;
};

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<AdminPayment[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadPayments() {
      try {
        setPageError(null);

        const accountData = (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        const paymentsData = await getAdminPayments();

        setAdminProfile(accountData.profile);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Admin payments load error:", error);

        setPageError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить платежи.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPayments();
  }, [router]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !normalizedSearch ||
        payment.user_email?.toLowerCase().includes(normalizedSearch) ||
        payment.user_id.toLowerCase().includes(normalizedSearch) ||
        String(payment.inv_id || "").includes(normalizedSearch) ||
        payment.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const successfulPayments = getSuccessfulPayments(payments);
  const failedPayments = getFailedPayments(payments);
  const pendingPayments = getPendingPayments(payments);
  const revenue = getPaymentsRevenue(payments);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-8 h-[520px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
          <div className="text-xl font-black">Ошибка загрузки платежей</div>
          <pre className="mt-4 whitespace-pre-wrap text-sm">{pageError}</pre>
        </div>
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
                Реальные платежи из таблицы payments: Robokassa invoice,
                статусы, выручка и мониторинг проблемных оплат.
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
          <RevenueChart revenue={revenue} payments={payments} />

          <WebhookPanel
            pendingCount={pendingPayments.length}
            failedCount={failedPayments.length}
            successCount={successfulPayments.length}
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm text-slate-500">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по email, user id, payment id или inv_id..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#111428] px-4 text-sm font-bold text-slate-200 outline-none"
            >
              <option value="all">Все статусы</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="succeeded">succeeded</option>
              <option value="success">success</option>
              <option value="failed">failed</option>
              <option value="error">error</option>
              <option value="canceled">canceled</option>
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <TableHead>Invoice</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
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
                    <td className="px-2 py-4">
                      <div className="text-sm font-bold text-slate-200">
                        {payment.inv_id ? `INV-${payment.inv_id}` : payment.id}
                      </div>

                      <div className="mt-1 max-w-[180px] truncate text-xs text-slate-600">
                        {payment.id}
                      </div>
                    </td>

                    <td className="px-2 py-4">
                      <div className="text-sm font-bold text-slate-200">
                        {payment.user_email || "Без email"}
                      </div>

                      <div className="mt-1 max-w-[220px] truncate text-xs text-slate-600">
                        {payment.user_id}
                      </div>
                    </td>

                    <td className="px-2 py-4">
                      <PlanPill plan={payment.plan_id} />
                    </td>

                    <td className="px-2 py-4 text-sm font-bold text-slate-200">
                      {Number(payment.amount || 0).toLocaleString("ru-RU")} ₽
                    </td>

                    <td className="px-2 py-4">
                      <PaymentStatus status={payment.status} />
                    </td>

                    <td className="px-2 py-4 text-sm text-slate-500">
                      {new Date(payment.created_at).toLocaleDateString("ru-RU")}
                    </td>

                    <td className="px-2 py-4">
                      <button
                        onClick={() =>
                          router.push(`/admin/users/${payment.user_id}`)
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
                      >
                        Пользователь
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function RevenueChart({
  revenue,
  payments,
}: {
  revenue: number;
  payments: AdminPayment[];
}) {
  const values = getChartValues(payments);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Revenue Flow</div>
          <div className="mt-1 text-xs text-slate-500">
            Выручка по реальным paid payments
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

function WebhookPanel({
  pendingCount,
  failedCount,
  successCount,
}: {
  pendingCount: number;
  failedCount: number;
  successCount: number;
}) {
  const events = [
    {
      title: "Successful payments",
      meta: `${successCount} подтверждённых оплат`,
      status: "ok",
    },
    {
      title: "Pending payments",
      meta: `${pendingCount} ожидают webhook/result`,
      status: pendingCount > 0 ? "warning" : "ok",
    },
    {
      title: "Failed payments",
      meta: `${failedCount} проблемных оплат`,
      status: failedCount > 0 ? "danger" : "ok",
    },
    {
      title: "Webhook logs",
      meta: "следующий этап: отдельная таблица webhook_logs",
      status: "soon",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Webhook Monitor</div>
          <div className="mt-1 text-xs text-slate-500">
            Foundation для Robokassa events
          </div>
        </div>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
          live
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div>
              <div className="text-sm font-bold text-slate-200">
                {event.title}
              </div>
              <div className="mt-1 text-xs text-slate-500">{event.meta}</div>
            </div>

            <EventStatus status={event.status} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const className =
    ["paid", "succeeded", "success"].includes(normalized)
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : ["failed", "error", "canceled"].includes(normalized)
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

function EventStatus({ status }: { status: string }) {
  const className =
    status === "ok"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : status === "danger"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
        : status === "warning"
          ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
          : "border-white/10 bg-white/[0.055] text-slate-300";

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[11px] font-bold ${className}`}
    >
      {status}
    </span>
  );
}

function PlanPill({ plan }: { plan: string }) {
  const className =
    plan === "smm_pro"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      : plan === "creator"
        ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
        : "border-white/10 bg-white/[0.055] text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${className}`}
    >
      {plan}
    </span>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-2 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">
      {children}
    </th>
  );
}

function getChartValues(payments: AdminPayment[]) {
  const successful = payments.filter((payment) =>
    ["paid", "succeeded", "success"].includes(payment.status.toLowerCase()),
  );

  if (successful.length === 0) {
    return [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
  }

  const lastTenDays = Array.from({ length: 10 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (9 - index));

    const dayKey = date.toISOString().slice(0, 10);

    return successful
      .filter((payment) => payment.created_at.slice(0, 10) === dayKey)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  });

  const max = Math.max(...lastTenDays);

  if (max === 0) {
    return lastTenDays.map(() => 8);
  }

  return lastTenDays.map((value) => Math.max(8, Math.round((value / max) * 92)));
}