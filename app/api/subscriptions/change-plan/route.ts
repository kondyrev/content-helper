import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type PlanId = "free" | "creator" | "smm_pro";

type SubscriptionActionMode =
  | "change_only"
  | "activate_30"
  | "extend_30"
  | "extend_90"
  | "set_custom_date"
  | "reset_free";

const VALID_PLANS: PlanId[] = ["free", "creator", "smm_pro"];

const VALID_MODES: SubscriptionActionMode[] = [
  "change_only",
  "activate_30",
  "extend_30",
  "extend_90",
  "set_custom_date",
  "reset_free",
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await supabaseServer
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const targetUserId = body.targetUserId as string | undefined;
    const requestedPlanId = body.newPlanId as PlanId | undefined;
    const mode = body.mode as SubscriptionActionMode | undefined;
    const customPeriodEnd = body.customPeriodEnd as string | undefined;

    if (!targetUserId || !mode) {
      return NextResponse.json(
        { error: "Missing targetUserId or mode" },
        { status: 400 },
      );
    }

    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (mode !== "reset_free") {
      if (!requestedPlanId || !VALID_PLANS.includes(requestedPlanId)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
    }

    const { data: targetProfile, error: targetError } = await supabaseServer
      .from("profiles")
      .select("id, email")
      .eq("id", targetUserId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const nextPlanId: PlanId =
      mode === "reset_free" ? "free" : (requestedPlanId as PlanId);

    const { data: plan, error: planError } = await supabaseServer
      .from("plans")
      .select("id, name, daily_limit, price_month")
      .eq("id", nextPlanId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const { data: currentSubscription } = await supabaseServer
      .from("subscriptions")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const now = new Date();

    let nextPeriodEnd: string | null =
      currentSubscription?.current_period_end || null;

    if (mode === "activate_30") {
      const date = new Date(now);
      date.setDate(date.getDate() + 30);
      nextPeriodEnd = date.toISOString();
    }

    if (mode === "extend_30" || mode === "extend_90") {
      const daysToAdd = mode === "extend_30" ? 30 : 90;

      const baseDate =
        currentSubscription?.current_period_end &&
        new Date(currentSubscription.current_period_end).getTime() > now.getTime()
          ? new Date(currentSubscription.current_period_end)
          : new Date(now);

      baseDate.setDate(baseDate.getDate() + daysToAdd);
      nextPeriodEnd = baseDate.toISOString();
    }

    if (mode === "set_custom_date") {
      if (!customPeriodEnd) {
        return NextResponse.json(
          { error: "Missing customPeriodEnd" },
          { status: 400 },
        );
      }

      const customDate = new Date(customPeriodEnd);

      if (Number.isNaN(customDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid customPeriodEnd" },
          { status: 400 },
        );
      }

      nextPeriodEnd = customDate.toISOString();
    }

    if (mode === "reset_free" || nextPlanId === "free") {
      nextPeriodEnd = null;
    }

    const nextSubscription = {
      user_id: targetUserId,
      plan_id: nextPlanId,
      status: "active",
      current_period_end: nextPeriodEnd,
      updated_at: now.toISOString(),
    };

    let subscriptionError;

    if (currentSubscription) {
      const { error } = await supabaseServer
        .from("subscriptions")
        .update({
          plan_id: nextSubscription.plan_id,
          status: nextSubscription.status,
          current_period_end: nextSubscription.current_period_end,
          updated_at: nextSubscription.updated_at,
        })
        .eq("user_id", targetUserId);

      subscriptionError = error;
    } else {
      const { error } = await supabaseServer.from("subscriptions").insert({
        user_id: nextSubscription.user_id,
        plan_id: nextSubscription.plan_id,
        status: nextSubscription.status,
        current_period_end: nextSubscription.current_period_end,
        updated_at: nextSubscription.updated_at,
      });

      subscriptionError = error;
    }

    if (subscriptionError) {
      return NextResponse.json(
        { error: subscriptionError.message },
        { status: 500 },
      );
    }

    await supabaseServer.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: targetUserId,
      action: "manage_subscription",
      entity_type: "subscription",
      entity_id: targetUserId,
      before_data: currentSubscription
        ? {
            plan_id: currentSubscription.plan_id,
            status: currentSubscription.status,
            current_period_end: currentSubscription.current_period_end,
          }
        : null,
      after_data: {
        plan_id: nextSubscription.plan_id,
        status: nextSubscription.status,
        current_period_end: nextSubscription.current_period_end,
      },
      metadata: {
        source: "admin_panel",
        mode,
        target_email: targetProfile.email,
        plan,
        custom_period_end: customPeriodEnd || null,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: nextSubscription,
    });
  } catch (error) {
    console.error("Admin manage subscription error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}