export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  assigned_admin_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;

  customer_email?: string | null;
  last_message_preview?: string | null;
  messages_count?: number;
  unread_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}