import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
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

    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Не удалось загрузить тикеты" },
        { status: 500 }
      );
    }

    const ticketIds = (tickets || []).map((ticket) => ticket.id);
    const userIds = Array.from(
      new Set((tickets || []).map((ticket) => ticket.user_id))
    );

    const { data: profiles } =
      userIds.length > 0
        ? await supabase.from("profiles").select("id,email").in("id", userIds)
        : { data: [] };

    const { data: messages } =
      ticketIds.length > 0
        ? await supabase
            .from("support_messages")
            .select("id,ticket_id,sender_id,message,created_at")
            .in("ticket_id", ticketIds)
            .order("created_at", { ascending: false })
        : { data: [] };

    const { data: reads } =
      ticketIds.length > 0
        ? await supabase
            .from("support_ticket_reads")
            .select("ticket_id,last_read_at")
            .eq("user_id", user.id)
            .in("ticket_id", ticketIds)
        : { data: [] };

    const profileById = new Map(
      (profiles || []).map((profile) => [profile.id, profile])
    );

    const readByTicketId = new Map(
      (reads || []).map((read) => [read.ticket_id, read.last_read_at])
    );

    type TicketMessagePreview = {
      id: string;
      ticket_id: string;
      sender_id: string;
      message: string;
      created_at: string;
    };

    const messagesByTicketId = new Map<string, TicketMessagePreview[]>();

    for (const message of messages || []) {
      const current = messagesByTicketId.get(message.ticket_id) || [];
      current.push(message);
      messagesByTicketId.set(message.ticket_id, current);
    }

    const enrichedTickets = (tickets || []).map((ticket) => {
      const ticketMessages = messagesByTicketId.get(ticket.id) || [];
      const lastMessage = ticketMessages[0];
      const lastReadAt = readByTicketId.get(ticket.id);

      const unreadCount = ticketMessages.filter((message) => {
        if (message.sender_id === user.id) return false;
        if (!lastReadAt) return true;

        return new Date(message.created_at).getTime() >
          new Date(lastReadAt).getTime();
      }).length;

      return {
        ...ticket,
        customer_email: profileById.get(ticket.user_id)?.email || null,
        last_message_preview: lastMessage?.message || ticket.description || null,
        messages_count: ticketMessages.length,
        unread_count: unreadCount,
      };
    });

    return NextResponse.json({ tickets: enrichedTickets });
  } catch (error) {
    console.error("Get support tickets error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const subject = body.subject?.trim();
    const description = body.description?.trim();
    const priority = body.priority || "medium";

    if (!subject) {
      return NextResponse.json({ error: "Тема обязательна" }, { status: 400 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject,
        description,
        priority,
      })
      .select()
      .single();

    if (ticketError) {
      console.error(ticketError);

      return NextResponse.json(
        { error: "Не удалось создать тикет" },
        { status: 500 }
      );
    }

    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: description || subject,
    });

    await supabase.from("support_ticket_reads").upsert({
      ticket_id: ticket.id,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}