"use client";

import {
  SUPPORT_PRIORITIES,
  SUPPORT_PRIORITY_LABELS,
} from "@/lib/support/constants";
import { TicketPriority, TicketStatus } from "@/lib/support/types";

export type UserTicketFilter =
  | "all"
  | "active"
  | "waiting_support"
  | "resolved"
  | "closed";

interface Props {
  search: string;
  status: UserTicketFilter;
  priority: "all" | TicketPriority;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserTicketFilter) => void;
  onPriorityChange: (value: "all" | TicketPriority) => void;
}

const USER_FILTERS: {
  value: UserTicketFilter;
  label: string;
}[] = [
  { value: "all", label: "Все тикеты" },
  { value: "active", label: "Открытые" },
  { value: "waiting_support", label: "Ждём поддержку" },
  { value: "resolved", label: "Решённые" },
  { value: "closed", label: "Закрытые" },
];

export function matchesUserTicketFilter(
  status: UserTicketFilter,
  ticketStatus: TicketStatus
) {
  if (status === "all") return true;

  if (status === "active") {
    return ticketStatus === "open" || ticketStatus === "in_progress";
  }

  if (status === "waiting_support") {
    return ticketStatus === "waiting_user";
  }

  return ticketStatus === status;
}

export default function UserTicketFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: Props) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-[1fr_200px_180px]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Поиск по теме или сообщению..."
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/50"
      />

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as UserTicketFilter)}
        className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/50"
      >
        {USER_FILTERS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
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