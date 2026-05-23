"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import { SupportMessage, SupportTicket } from "@/lib/support/types";
import EmptySupportState from "./EmptySupportState";
import CreateTicketButton from "./CreateTicketButton";
import CreateTicketDialog from "./CreateTicketDialog";
import TicketDetails from "./TicketDetails";
import TicketList from "./TicketList";

type TicketDetailsResponse = {
  ticket: SupportTicket;
  messages: SupportMessage[];
};

export default function UserSupportView() {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const getAccessToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setCurrentUserId(session?.user?.id || "");

    return session?.access_token;
  }, [supabase]);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = await getAccessToken();

      if (!token) return;

      const response = await fetch("/api/support/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось загрузить тикеты");
      }

      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Load support tickets error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  const loadTicketDetails = useCallback(
    async (ticketId: string) => {
      try {
        setIsDetailsLoading(true);
        setSelectedTicketId(ticketId);

        const token = await getAccessToken();

        if (!token) return;

        const response = await fetch(`/api/support/tickets/${ticketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await response.json()) as TicketDetailsResponse;

        if (!response.ok) {
          throw new Error("Не удалось загрузить тикет");
        }

        setSelectedTicket(data.ticket);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Load ticket details error:", error);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [getAccessToken]
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  return (
    <>
      <div className="flex justify-end">
        <CreateTicketButton onClick={() => setIsCreateOpen(true)} />
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={loadTicketDetails}
          />

          {isDetailsLoading ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
            </div>
          ) : (
            <TicketDetails
              ticket={selectedTicket}
              messages={messages}
              currentUserId={currentUserId}
              onMessageCreated={(newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
                void loadTickets();
              }}
            />
          )}
        </div>
      ) : (
        <EmptySupportState />
      )}

      <CreateTicketDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadTickets}
      />
    </>
  );
}