import { createClient } from "@/utils/supabase";

export async function getAdminOverview() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch("/api/account/me", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(data?.error || "Failed to load admin overview");
  }

  return data;
}