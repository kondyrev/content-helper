import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
};

export type Plan = {
  id: string;
  name: string;
  daily_limit: number;
  price_month: number;
};

export async function ensureUserAccount(
  supabase: SupabaseClient,
  currentUser: User
) {
  let profile: Profile | null = null;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (existingProfile) {
    profile = existingProfile as Profile;
  } else {
    const { data: createdProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        email: currentUser.email,
        role: "user",
      })
      .select("id, email, role")
      .single();

    if (error) {
      throw error;
    }

    profile = createdProfile as Profile;
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id, user_id, plan_id, status")
    .eq("user_id", currentUser.id)
    .eq("status", "active")
    .maybeSingle();

  let planId = existingSubscription?.plan_id || "free";

  if (!existingSubscription) {
    const { data: createdSubscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: currentUser.id,
        plan_id: "free",
        status: "active",
      })
      .select("plan_id")
      .single();

    if (error) {
      throw error;
    }

    planId = createdSubscription.plan_id;
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, name, daily_limit, price_month")
    .eq("id", planId)
    .single();

  if (planError) {
    throw planError;
  }

  return {
    profile,
    plan: plan as Plan,
  };
}
export async function loadTodayCount(
  supabase: SupabaseClient,
  userId: string
) {
  const startOfDay = new Date();

  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("generations")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function loadHistory(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveGenerationToCloud(
  supabase: SupabaseClient,
  userId: string,
  topic: string,
  platform: string,
  style: string,
  result: string
) {
  const { error } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      topic,
      platform,
      style,
      result,
    });

  if (error) {
    throw error;
  }
}

export async function loadProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: "user" | "admin"
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}