import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Params {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: "Не удалось загрузить сообщения" },
        { status: 500 }
      );
    }

    await supabase.from("support_ticket_reads").upsert({
      ticket_id: ticketId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ticket,
      messages: messages || [],
    });
  } catch (error) {
    console.error("Get support ticket details error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const allowedStatuses = [
      "open",
      "in_progress",
      "waiting_user",
      "resolved",
      "closed",
    ];

    const allowedPriorities = ["low", "medium", "high", "urgent"];

    const updates: Record<string, string | null> = {};

    if (body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Некорректный статус" },
          { status: 400 }
        );
      }

      updates.status = body.status;
      updates.closed_at =
        body.status === "closed" || body.status === "resolved"
          ? new Date().toISOString()
          : null;
    }

    if (body.priority) {
      if (!allowedPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Некорректный приоритет" },
          { status: 400 }
        );
      }

      updates.priority = body.priority;
    }

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Не удалось обновить тикет" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Update support ticket error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}