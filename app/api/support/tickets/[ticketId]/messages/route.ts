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
    });
  } catch (error) {
    console.error("Create support message error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}