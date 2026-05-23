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

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: Props) {
  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelectTicket(ticket.id)}
          className={`rounded-3xl border p-5 text-left backdrop-blur-xl transition ${
            selectedTicketId === ticket.id
              ? "border-violet-400/50 bg-violet-400/10"
              : "border-white/10 bg-white/[0.04] hover:border-violet-400/40 hover:bg-white/[0.07]"
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {ticket.subject}
              </h3>

              {ticket.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
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

          <div className="mt-4 text-xs text-zinc-500">
            Обновлён:{" "}
            {new Date(ticket.last_message_at).toLocaleString("ru-RU")}
          </div>
        </button>
      ))}
    </div>
  );
}