import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
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

    const { data: payments, error: paymentsError } = await supabaseServer
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

    if (paymentsError) {
      return NextResponse.json(
        { error: paymentsError.message },
        { status: 500 },
      );
    }

    const userIds = Array.from(
      new Set((payments || []).map((payment) => payment.user_id).filter(Boolean)),
    );

    let profilesMap = new Map<string, string | null>();

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseServer
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        return NextResponse.json(
          { error: profilesError.message },
          { status: 500 },
        );
      }

      profilesMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile.email]),
      );
    }

    const enrichedPayments = (payments || []).map((payment) => ({
      ...payment,
      user_email: profilesMap.get(payment.user_id) || null,
    }));

    return NextResponse.json({ payments: enrichedPayments });
  } catch (error) {
    console.error("Admin payments API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}