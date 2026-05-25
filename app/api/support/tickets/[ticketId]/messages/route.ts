import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Params {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: Params) {
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

    const body = await request.json();

    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Сообщение обязательно" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: "Тикет не найден" },
        { status: 404 }
      );
    }

    if (!isAdmin && ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ticket.status === "closed" && !isAdmin) {
      return NextResponse.json(
        { error: "Тикет закрыт" },
        { status: 400 }
      );
    }

    const { data: createdMessage, error: messageError } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message,
      })
      .select()
      .single();

    if (messageError) {
      console.error(messageError);

      return NextResponse.json(
        { error: "Не удалось отправить сообщение" },
        { status: 500 }
      );
    }

    const nextStatus = isAdmin ? "waiting_user" : "in_progress";

    const ticketUpdates: Record<string, string | null> = {
      status: nextStatus,
      closed_at: null,
    };

    if (isAdmin && !ticket.assigned_admin_id) {
      ticketUpdates.assigned_admin_id = user.id;
    }

    const { data: updatedTicket } = await supabase
      .from("support_tickets")
      .update(ticketUpdates)
      .eq("id", ticketId)
      .select()
      .single();

    await supabase.from("support_ticket_reads").upsert({
      ticket_id: ticketId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: createdMessage,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Create support message error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}