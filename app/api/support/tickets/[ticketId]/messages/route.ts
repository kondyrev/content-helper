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
        { error: "Сообщение не может быть пустым" },
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
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    if (ticket.status === "closed" && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Тикет закрыт. Если вопрос ещё актуален, создайте новое обращение.",
        },
        { status: 403 }
      );
    }

    let updatedTicket = ticket;

    if (ticket.status === "resolved" && !isAdmin) {
      const { data: reopenedTicket, error: reopenError } = await supabase
        .from("support_tickets")
        .update({
          status: "open",
          closed_at: null,
        })
        .eq("id", ticketId)
        .select()
        .single();

      if (reopenError) {
        console.error(reopenError);

        return NextResponse.json(
          { error: "Не удалось переоткрыть тикет" },
          { status: 500 }
        );
      }

      updatedTicket = reopenedTicket;
    }

    const { data: createdMessage, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message,
        is_internal: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Не удалось отправить сообщение" },
        { status: 500 }
      );
    }

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