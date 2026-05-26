import { createClient } from "@/utils/supabase";

export type AdminPayment = {
  id: string;
  user_id: string;
  plan_id: string;
  inv_id: number | null;
  amount: number;
  status: string;
  created_at: string;
  user_email?: string | null;
};

export async function getAdminPayments(): Promise<AdminPayment[]> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch("/api/admin/payments", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(data?.error || "Failed to load payments");
  }

  return data.payments || [];
}

export function getPaymentsRevenue(payments: AdminPayment[]) {
  return payments
    .filter((payment) =>
      ["paid", "succeeded", "success"].includes(payment.status.toLowerCase()),
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

export function getSuccessfulPayments(payments: AdminPayment[]) {
  return payments.filter((payment) =>
    ["paid", "succeeded", "success"].includes(payment.status.toLowerCase()),
  );
}

export function getFailedPayments(payments: AdminPayment[]) {
  return payments.filter((payment) =>
    ["failed", "error", "canceled"].includes(payment.status.toLowerCase()),
  );
}

export function getPendingPayments(payments: AdminPayment[]) {
  return payments.filter((payment) =>
    ["pending", "created"].includes(payment.status.toLowerCase()),
  );
}