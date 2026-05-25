import { SupabaseClient } from "@supabase/supabase-js";

interface SubscribeToMessagesParams {
  supabase: SupabaseClient;
  ticketId: string;
  onInsert: (payload: unknown) => void;
}

export function subscribeToTicketMessages({
  supabase,
  ticketId,
  onInsert,
}: SubscribeToMessagesParams) {
  return supabase
    .channel(`support-ticket-${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `ticket_id=eq.${ticketId}`,
      },
      onInsert
    )
    .subscribe();
}

interface SubscribeToTicketsParams {
  supabase: SupabaseClient;
  onChange: () => void;
}

export function subscribeToTickets({
  supabase,
  onChange,
}: SubscribeToTicketsParams) {
  return supabase
    .channel("support-tickets")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "support_tickets",
      },
      onChange
    )
    .subscribe();
}