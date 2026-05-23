import { TicketPriority, TicketStatus } from "./types";

export const SUPPORT_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
];

export const SUPPORT_PRIORITIES: TicketPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];