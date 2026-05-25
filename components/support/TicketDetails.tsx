"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SUPPORT_PRIORITIES,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABELS,
} from "@/lib/support/constants";
import {
  SupportMessage,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "@/lib/support/types";

interface Props {
  ticket: SupportTicket | null;
  messages: SupportMessage[];
  currentUserId: string;
  isAdmin?: boolean;
  onBack?: () => void;
  onMessageCreated?: (message: SupportMessage) => void;
  onTicketUpdated?: (ticket: SupportTicket) => void;
}

export default function TicketDetails({
  ticket,
  messages,
  currentUserId,
  isAdmin = false,
  onBack,
  onMessageCreated,
  onTicketUpdated,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!ticket) {
    return (
      <div className="hidden min-h-[600px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl lg:flex">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-3xl">
            💬
          </div>

          <h3 className="text-xl font-semibold text-white">Выберите тикет</h3>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Откройте обращение слева, чтобы просмотреть переписку и ответить.
          </p>
        </div>
      </div>
    );
  }

  const isClosedForUser = ticket.status === "closed" && !isAdmin;
  const isResolvedForUser = ticket.status === "resolved" && !isAdmin;

  async function handleSendMessage() {
    if (!ticket || !message.trim() || isClosedForUser) return;

    try {
      setIsSending(true);
      setSendError("");

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
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось отправить сообщение");
      }

      setMessage("");
      onMessageCreated?.(data.message);

      if (data.ticket) {
        onTicketUpdated?.(data.ticket);
      }
    } catch (error) {
      console.error("Send support message error:", error);

      setSendError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить сообщение"
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleUpdateTicket(updates: {
    status?: TicketStatus;
    priority?: TicketPriority;
  }) {
    if (!ticket) return;

    try {
      setIsUpdating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const response = await fetch(`/api/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось обновить тикет");
      }

      onTicketUpdated?.(data.ticket);
    } catch (error) {
      console.error("Update support ticket error:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-150px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl lg:h-[calc(100vh-180px)]">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 px-4 py-4 backdrop-blur-2xl md:px-5 md:py-5">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07] hover:text-white lg:hidden"
          >
            <span>←</span>
            К списку тикетов
          </button>
        )}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {SUPPORT_STATUS_LABELS[ticket.status]}
              </span>

              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                {SUPPORT_PRIORITY_LABELS[ticket.priority]}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-bold text-white md:text-2xl">
              {ticket.subject}
            </h2>

            {ticket.customer_email && (
              <p className="mt-2 text-sm text-zinc-500">
                {ticket.customer_email}
              </p>
            )}

            {ticket.description && (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                {ticket.description}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="grid w-full gap-3 md:w-[320px]">
              <label className="space-y-2">
                <span className="text-xs text-zinc-500">Статус</span>

                <select
                  value={ticket.status}
                  disabled={isUpdating}
                  onChange={(event) =>
                    handleUpdateTicket({
                      status: event.target.value as TicketStatus,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                >
                  {SUPPORT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {SUPPORT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-zinc-500">Приоритет</span>

                <select
                  value={ticket.priority}
                  disabled={isUpdating}
                  onChange={(event) =>
                    handleUpdateTicket({
                      priority: event.target.value as TicketPriority,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                >
                  {SUPPORT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {SUPPORT_PRIORITY_LABELS[priority]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-5 md:py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-2xl">
                ✨
              </div>

              <h3 className="text-lg font-semibold text-white">
                Пока нет сообщений
              </h3>

              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Начните переписку, отправив первое сообщение.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((item) => {
              const isMine = item.sender_id === currentUserId;

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[92%] rounded-[24px] px-5 py-4 shadow-lg transition-all md:max-w-[75%] ${
                      isMine
                        ? "bg-violet-500 text-white shadow-violet-500/10"
                        : "border border-white/10 bg-white/[0.04] text-zinc-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                      {item.message}
                    </p>

                    <div
                      className={`mt-3 text-[11px] ${
                        isMine ? "text-violet-100" : "text-zinc-500"
                      }`}
                    >
                      {new Date(item.created_at).toLocaleString("ru-RU")}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
        {isClosedForUser ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-zinc-400">
            Этот тикет закрыт. Если вопрос всё ещё актуален — создайте новое
            обращение.
          </div>
        ) : (
          <>
            {isResolvedForUser && (
              <div className="mb-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Тикет отмечен как решённый. Новое сообщение автоматически
                переоткроет обращение.
              </div>
            )}

            {sendError && (
              <div className="mb-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                {sendError}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Напишите сообщение..."
                rows={2}
                className="min-h-[60px] flex-1 resize-none rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/50"
              />

              <button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                className="rounded-[22px] bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}