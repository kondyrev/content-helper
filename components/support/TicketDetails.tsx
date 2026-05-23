"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_LABELS,
} from "@/lib/support/constants";
import { SupportMessage, SupportTicket } from "@/lib/support/types";

interface Props {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  currentUserId: string;
  onMessageCreated?: (message: SupportMessage) => void;
}

export default function TicketDetails({
  ticket,
  messages,
  currentUserId,
  onMessageCreated,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!ticket) {
    return (
      <div className="hidden min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-zinc-400 backdrop-blur-xl lg:flex">
        Выберите тикет
      </div>
    );
  }

  async function handleSendMessage() {
    if (!ticket || !message.trim()) return;

    try {
      setIsSending(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const response = await fetch(
        `/api/support/tickets/${ticket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось отправить сообщение");
      }

      setMessage("");
      onMessageCreated?.(data.message);
    } catch (error) {
      console.error("Send support message error:", error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-[500px] flex-col rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{ticket.subject}</h2>

            {ticket.description && (
              <p className="mt-1 text-sm text-zinc-400">
                {ticket.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {SUPPORT_STATUS_LABELS[ticket.status]}
            </span>

            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
              {SUPPORT_PRIORITY_LABELS[ticket.priority]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-5">
        {messages.map((item) => {
          const isMine = item.sender_id === currentUserId;

          return (
            <div
              key={item.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isMine
                    ? "bg-violet-500 text-white"
                    : "border border-white/10 bg-white/5 text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{item.message}</p>

                <div
                  className={`mt-2 text-[11px] ${
                    isMine ? "text-violet-100" : "text-zinc-500"
                  }`}
                >
                  {new Date(item.created_at).toLocaleString("ru-RU")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Напишите сообщение..."
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/50"
          />

          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}