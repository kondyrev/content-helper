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