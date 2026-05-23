"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import { SupportMessage, SupportTicket } from "@/lib/support/types";
import TicketList from "./TicketList";
import TicketDetails from "./TicketDetails";

type TicketDetailsResponse = {
  ticket: SupportTicket;
  messages: SupportMessage[];
};

export default function AdminSupportView() {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState("");
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
      console.error("Load admin support tickets error:", error);
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
        console.error("Load admin ticket details error:", error);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [getAccessToken]
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0) {
      void loadTicketDetails(tickets[0].id);
    }
  }, [tickets, selectedTicketId, loadTicketDetails]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-zinc-400">Всего тикетов</p>
          <p className="mt-2 text-3xl font-bold text-white">{tickets.length}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-zinc-400">Открытые</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {tickets.filter((ticket) => ticket.status === "open").length}
          </p>
        </div>

        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5">
          <p className="text-sm text-red-100/80">Срочные</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {tickets.filter((ticket) => ticket.priority === "urgent").length}
          </p>
        </div>

        <div className="rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
          <p className="text-sm text-violet-100/80">В работе</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {tickets.filter((ticket) => ticket.status === "in_progress").length}
          </p>
        </div>
      </div>

      {tickets.length > 0 ? (
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
              isAdmin
              onMessageCreated={(newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
                void loadTickets();
              }}
              onTicketUpdated={(updatedTicket) => {
                setSelectedTicket((prev) =>
                  prev ? { ...prev, ...updatedTicket } : updatedTicket
                );

                setTickets((prev) =>
                  prev.map((ticket) =>
                    ticket.id === updatedTicket.id
                      ? { ...ticket, ...updatedTicket }
                      : ticket
                  )
                );
              }}
            />
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
          Пока нет тикетов
        </div>
      )}
    </div>
  );
}