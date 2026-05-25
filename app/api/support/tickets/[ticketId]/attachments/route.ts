import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface Params {
  params: Promise<{
    ticketId: string;
  }>;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^\w.\-а-яА-ЯёЁ]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
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

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];
    const messageId = formData.get("messageId")?.toString() || null;

    if (files.length === 0) {
      return NextResponse.json({ error: "Файлы не выбраны" }, { status: 400 });
    }

    const maxFileSize = 10 * 1024 * 1024;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Можно прикреплять только изображения" },
          { status: 400 }
        );
      }

      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `Файл ${file.name} больше 10 МБ` },
          { status: 400 }
        );
      }
    }

    const uploadedAttachments = [];

    for (const file of files) {
      const safeName = sanitizeFileName(file.name);
      const filePath = `${ticketId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { error: "Не удалось загрузить изображение" },
          { status: 500 }
        );
      }

      const { data: attachment, error: attachmentError } = await supabase
        .from("support_attachments")
        .insert({
          ticket_id: ticketId,
          message_id: messageId,
          uploaded_by: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (attachmentError) {
        console.error(attachmentError);
        return NextResponse.json(
          { error: "Не удалось сохранить вложение" },
          { status: 500 }
        );
      }

      const { data: signedUrlData } = await supabase.storage
        .from("support-attachments")
        .createSignedUrl(filePath, 60 * 60);

      uploadedAttachments.push({
        ...attachment,
        signed_url: signedUrlData?.signedUrl || null,
      });
    }

    return NextResponse.json({
      success: true,
      attachments: uploadedAttachments,
    });
  } catch (error) {
    console.error("Upload support attachments error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}