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

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: Props) {
  return (
    <div className="grid max-h-[calc(100vh-260px)] gap-3 overflow-y-auto pr-1">
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id;

        return (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket.id)}
            className={`rounded-3xl border p-5 text-left backdrop-blur-xl transition ${
              isSelected
                ? "border-violet-400/60 bg-violet-400/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                : "border-white/10 bg-white/[0.04] hover:border-violet-400/40 hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />

                  <p className="truncate text-xs text-zinc-400">
                    {ticket.customer_email || "Клиент"}
                  </p>
                </div>

                <h3 className="mt-2 line-clamp-1 text-base font-semibold text-white">
                  {ticket.subject}
                </h3>
              </div>

              <span className="shrink-0 text-xs text-zinc-500">
                {formatDate(ticket.last_message_at)}
              </span>
            </div>

            {ticket.last_message_preview && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                {ticket.last_message_preview}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                {SUPPORT_STATUS_LABELS[ticket.status]}
              </span>

              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                {SUPPORT_PRIORITY_LABELS[ticket.priority]}
              </span>

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