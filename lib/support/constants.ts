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

export const SUPPORT_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  urgent: "Срочная",
};

export const SUPPORT_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Открыт",
  in_progress: "В работе",
  waiting_user: "Ожидает ответа",
  resolved: "Решён",
  closed: "Закрыт",
};