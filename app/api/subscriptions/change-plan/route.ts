import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type PlanId = "free" | "creator" | "smm_pro";

const VALID_PLANS: PlanId[] = ["free", "creator", "smm_pro"];

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

    const targetUserId = body.targetUserId as string;
    const newPlanId = body.newPlanId as PlanId;

    if (!targetUserId || !newPlanId) {
      return NextResponse.json(
        { error: "Missing targetUserId or newPlanId" },
        { status: 400 },
      );
    }

    if (!VALID_PLANS.includes(newPlanId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: targetProfile, error: targetError } = await supabaseServer
      .from("profiles")
      .select("id, email")
      .eq("id", targetUserId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: plan, error: planError } = await supabaseServer
      .from("plans")
      .select("id, name, daily_limit, price_month")
      .eq("id", newPlanId)
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
    const nextPeriodEnd = new Date(now);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);

    const nextSubscription = {
      user_id: targetUserId,
      plan_id: newPlanId,
      status: "active",
      current_period_end:
        newPlanId === "free" ? null : nextPeriodEnd.toISOString(),
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
      action: "change_plan",
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
        target_email: targetProfile.email,
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: nextSubscription,
    });
  } catch (error) {
    console.error("Admin change plan error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}