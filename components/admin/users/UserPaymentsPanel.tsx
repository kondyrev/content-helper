import type { AdminPayment } from "@/lib/admin/payments";

type UserPaymentsPanelProps = {
  payments: AdminPayment[];
};

export function UserPaymentsPanel({ payments }: UserPaymentsPanelProps) {
  const paidPayments = payments.filter((payment) =>
    ["paid", "succeeded", "success"].includes(payment.status.toLowerCase()),
  );

  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Payments</div>
          <div className="mt-1 text-xs text-slate-500">
            История оплат пользователя
          </div>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
          {totalRevenue.toLocaleString("ru-RU")} ₽
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {payments.slice(0, 6).map((payment) => (
          <div
            key={payment.id}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-200">
                  {payment.inv_id ? `INV-${payment.inv_id}` : payment.id}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {payment.plan_id} ·{" "}
                  {new Date(payment.created_at).toLocaleDateString("ru-RU")}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-100">
                  {Number(payment.amount || 0).toLocaleString("ru-RU")} ₽
                </div>

                <PaymentStatus status={payment.status} />
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-6 text-center text-sm text-slate-500">
            Оплат пока нет
          </div>
        ) : null}
      </div>
    </div>
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
    <div
      className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${className}`}
    >
      {status}
    </div>
  );
}