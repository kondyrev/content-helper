import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    let { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("id, email, role, created_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      const { data: insertedProfile, error: insertProfileError } =
        await supabaseServer
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            role: "user",
          })
          .select("id, email, role, created_at")
          .single();

      if (insertProfileError || !insertedProfile) {
        console.error("Profile bootstrap error:", insertProfileError);
        return NextResponse.json(
          { error: "Profile bootstrap failed" },
          { status: 500 }
        );
      }

      profile = insertedProfile;
    }

    let { data: subscription, error: subscriptionError } = await supabaseServer
      .from("subscriptions")
      .select("user_id, plan_id, status")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscription) {
      const { data: insertedSubscription, error: insertSubscriptionError } =
        await supabaseServer
          .from("subscriptions")
          .insert({
            user_id: user.id,
            plan_id: "free",
            status: "active",
          })
          .select("user_id, plan_id, status")
          .single();

      if (insertSubscriptionError || !insertedSubscription) {
        console.error("Subscription bootstrap error:", insertSubscriptionError);
        return NextResponse.json(
          { error: "Subscription bootstrap failed" },
          { status: 500 }
        );
      }

      subscription = insertedSubscription;
    }

    const { data: plan, error: planError } = await supabaseServer
      .from("plans")
      .select("id, name, daily_limit, price_month, created_at")
      .eq("id", subscription.plan_id || "free")
      .single();

    if (planError || !plan) {
      console.error("Plan load error:", planError);
      return NextResponse.json({ error: "Plan not found" }, { status: 500 });
    }

    const { data: history, error: historyError } = await supabaseServer
      .from("generations")
      .select("id, user_id, topic, platform, style, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (historyError) {
      console.error("History load error:", historyError);
      return NextResponse.json(
        { error: "History load failed" },
        { status: 500 }
      );
    }

    const { count, error: countError } = await supabaseServer
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfTodayIso());

    if (countError) {
      console.error("Today count load error:", countError);
      return NextResponse.json(
        { error: "Usage load failed" },
        { status: 500 }
      );
    }

    let profiles: unknown[] = [];
    let subscriptions: unknown[] = [];

    if (profile.role === "admin") {
      const { data: profilesData } = await supabaseServer
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      const { data: subscriptionsData } = await supabaseServer
        .from("subscriptions")
        .select(
          "user_id, plan_id, status, plans(id, name, daily_limit, price_month)"
        );

      profiles = profilesData || [];
      subscriptions = subscriptionsData || [];
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
      subscription,
      plan,
      history: history || [],
      todayCount: count || 0,
      profiles,
      subscriptions,
    });
  } catch (error) {
    console.error("Account me error:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
