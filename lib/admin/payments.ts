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

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      user_id,
      plan_id,
      inv_id,
      amount,
      status,
      created_at,
      updated_at
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const payments = data || [];

  const userIds = Array.from(
    new Set(payments.map((payment) => payment.user_id).filter(Boolean)),
  );

  if (userIds.length === 0) {
    return payments;
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profilesMap = new Map(
    (profiles || []).map((profile) => [profile.id, profile.email]),
  );

  return payments.map((payment) => ({
    ...payment,
    user_email: profilesMap.get(payment.user_id) || null,
  }));
}

export function getPaymentsRevenue(payments: AdminPayment[]) {
  return payments
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

export function getSuccessfulPayments(payments: AdminPayment[]) {
  return payments.filter((payment) => payment.status === "succeeded");
}

export function getFailedPayments(payments: AdminPayment[]) {
  return payments.filter((payment) =>
    ["failed", "error", "canceled"].includes(payment.status),
  );
}

export function getPendingPayments(payments: AdminPayment[]) {
  return payments.filter((payment) =>
    ["pending", "created"].includes(payment.status),
  );
}