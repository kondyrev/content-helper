import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: adminProfile } = await supabaseServer
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const targetUserId = body.targetUserId as string;
    const newRole = body.newRole as "user" | "admin";

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 },
      );
    }

    if (!["user", "admin"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    if (targetUserId === user.id && newRole !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 },
      );
    }

    const { data: targetProfile } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const { error: updateError } = await supabaseServer
      .from("profiles")
      .update({
        role: newRole,
      })
      .eq("id", targetUserId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    await supabaseServer.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: targetUserId,
      action: "update_role",
      entity_type: "profile",
      entity_id: targetUserId,
      before_data: {
        role: targetProfile.role,
      },
      after_data: {
        role: newRole,
      },
      metadata: {
        source: "admin_panel",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Update role error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}