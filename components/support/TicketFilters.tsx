"use client";

import {
  SUPPORT_PRIORITIES,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABELS,
} from "@/lib/support/constants";
import { TicketPriority, TicketStatus } from "@/lib/support/types";

interface Props {
  search: string;
  status: "all" | TicketStatus;
  priority: "all" | TicketPriority;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | TicketStatus) => void;
  onPriorityChange: (value: "all" | TicketPriority) => void;
}

export default function TicketFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: Props) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-[1fr_180px_180px]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Поиск по теме, сообщению или email..."
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/50"
      />

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as "all" | TicketStatus)
        }
        className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
      >
        <option value="all">Все статусы</option>

        {SUPPORT_STATUSES.map((item) => (
          <option key={item} value={item}>
            {SUPPORT_STATUS_LABELS[item]}
          </option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(event) =>
          onPriorityChange(event.target.value as "all" | TicketPriority)
        }
        className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
      >
        <option value="all">Все приоритеты</option>

        {SUPPORT_PRIORITIES.map((item) => (
          <option key={item} value={item}>
            {SUPPORT_PRIORITY_LABELS[item]}
          </option>
        ))}
      </select>
    </div>
  );
}