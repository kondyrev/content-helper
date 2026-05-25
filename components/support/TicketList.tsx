import {
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_LABELS,
} from "@/lib/support/constants";
import { SupportTicket } from "@/lib/support/types";

interface Props {
  tickets: SupportTicket[];
  selectedTicketId?: string | null;
  onSelectTicket: (ticketId: string) => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWorkflowHint(ticket: SupportTicket) {
  if (ticket.status === "waiting_user") {
    return {
      label: "Ждём пользователя",
      className:
        "border-amber-400/20 bg-amber-400/10 text-amber-100",
    };
  }

  if (ticket.status === "in_progress" || ticket.status === "open") {
    return {
      label: "Нужен ответ",
      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    };
  }

  if (ticket.status === "resolved") {
    return {
      label: "Решён",
      className:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    };
  }

  if (ticket.status === "closed") {
    return {
      label: "Закрыт",
      className:
        "border-white/10 bg-white/[0.04] text-zinc-400",
    };
  }

  return null;
}

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: Props) {
  return (
    <div className="grid max-h-[calc(100vh-260px)] gap-3 overflow-y-auto pr-1">
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id;
        const unreadCount = ticket.unread_count || 0;
        const workflowHint = getWorkflowHint(ticket);
        const needsAttention =
          unreadCount > 0 ||
          ticket.status === "open" ||
          ticket.status === "in_progress";

        return (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket.id)}
            className={`rounded-3xl border p-5 text-left backdrop-blur-xl transition ${
              isSelected
                ? "border-violet-400/60 bg-violet-400/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                : needsAttention
                  ? "border-emerald-400/20 bg-emerald-400/[0.06] hover:border-emerald-400/40 hover:bg-emerald-400/[0.08]"
                  : "border-white/10 bg-white/[0.04] hover:border-violet-400/40 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      unreadCount > 0
                        ? "bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]"
                        : ticket.status === "waiting_user"
                          ? "bg-amber-400"
                          : ticket.status === "closed"
                            ? "bg-zinc-600"
                            : "bg-violet-400"
                    }`}
                  />

                  <p className="truncate text-xs text-zinc-400">
                    {ticket.customer_email || "Клиент"}
                  </p>
                </div>

                <h3
                  className={`mt-2 line-clamp-1 text-base font-semibold ${
                    unreadCount > 0 ? "text-white" : "text-zinc-100"
                  }`}
                >
                  {ticket.subject}
                </h3>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-xs text-zinc-500">
                  {formatDate(ticket.last_message_at)}
                </span>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-xs font-semibold text-black">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            {ticket.last_message_preview && (
              <p
                className={`mt-3 line-clamp-2 text-sm leading-6 ${
                  unreadCount > 0 ? "text-zinc-100" : "text-zinc-400"
                }`}
              >
                {ticket.last_message_preview}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {workflowHint && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${workflowHint.className}`}
                >
                  {workflowHint.label}
                </span>
              )}

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {SUPPORT_STATUS_LABELS[ticket.status]}
              </span>

              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                {SUPPORT_PRIORITY_LABELS[ticket.priority]}
              </span>

              {ticket.assigned_admin_id && (
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                  Назначен
                </span>
              )}

              <span className="ml-auto rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-400">
                {ticket.messages_count || 0} сообщ.
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}