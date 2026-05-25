import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Params {
  params: Promise<{
    ticketId: string;
  }>;
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension === fileName.toLowerCase()) {
    return "jpg";
  }

  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

function createStorageFileName(fileName: string) {
  const extension = getFileExtension(fileName);

  return `${crypto.randomUUID()}.${extension}`;
}

async function createSignedAttachment(
  supabase: ReturnType<typeof createClient<any, "public", any>>,
  attachment: {
    id: string;
    ticket_id: string;
    message_id: string | null;
    uploaded_by: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    created_at: string;
  }
) {
  const { data } = await supabase.storage
    .from("support-attachments")
    .createSignedUrl(attachment.file_path, 60 * 60);

  return {
    ...attachment,
    signed_url: data?.signedUrl || null,
  };
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

    const formData = await request.formData();

    const rawMessage = formData.get("message")?.toString().trim() || "";
    const files = formData.getAll("files").filter(Boolean) as File[];

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (files.length !== imageFiles.length) {
      return NextResponse.json(
        { error: "Можно прикреплять только изображения" },
        { status: 400 }
      );
    }

    if (!rawMessage && imageFiles.length === 0) {
      return NextResponse.json(
        { error: "Сообщение или скриншот обязательны" },
        { status: 400 }
      );
    }

    const maxFileSize = 10 * 1024 * 1024;

    for (const file of imageFiles) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `Файл ${file.name} больше 10 МБ` },
          { status: 400 }
        );
      }
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

    if (!isAdmin && ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ticket.status === "closed" && !isAdmin) {
      return NextResponse.json({ error: "Тикет закрыт" }, { status: 400 });
    }

    const messageText = rawMessage || "Скриншот";

    const { data: createdMessage, error: messageError } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message: messageText,
        is_internal: false,
      })
      .select()
      .single();

    if (messageError || !createdMessage) {
      console.error(messageError);

      return NextResponse.json(
        { error: "Не удалось отправить сообщение" },
        { status: 500 }
      );
    }

    const uploadedAttachments = [];

    for (const file of imageFiles) {
      const storageFileName = createStorageFileName(file.name);

      const filePath = `${ticketId}/${Date.now()}-${storageFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);

        return NextResponse.json(
          { error: "Сообщение создано, но скриншот загрузить не удалось" },
          { status: 500 }
        );
      }

      const { data: attachment, error: attachmentError } = await supabase
        .from("support_attachments")
        .insert({
          ticket_id: ticketId,
          message_id: createdMessage.id,
          uploaded_by: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (attachmentError || !attachment) {
        console.error(attachmentError);

        return NextResponse.json(
          { error: "Сообщение создано, но вложение сохранить не удалось" },
          { status: 500 }
        );
      }

      uploadedAttachments.push(
        await createSignedAttachment(supabase, attachment)
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
      message: {
        ...createdMessage,
        attachments: uploadedAttachments,
      },
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