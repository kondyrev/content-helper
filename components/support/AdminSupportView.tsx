"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SupportMessage,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "@/lib/support/types";
import {
  subscribeToTicketMessages,
  subscribeToTickets,
} from "@/lib/support/realtime";
import TicketList from "./TicketList";
import TicketDetails from "./TicketDetails";
import TicketFilters from "./TicketFilters";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>(
    "all"
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        ticket.customer_email?.toLowerCase().includes(normalizedSearch) ||
        ticket.last_message_preview?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

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
    if (!selectedTicketId && filteredTickets.length > 0) {
      void loadTicketDetails(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId, loadTicketDetails]);

  useEffect(() => {
    if (
      selectedTicketId &&
      filteredTickets.length > 0 &&
      !filteredTickets.some((ticket) => ticket.id === selectedTicketId)
    ) {
      setSelectedTicketId(null);
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [filteredTickets, selectedTicketId]);

  useEffect(() => {
    const ticketsChannel = subscribeToTickets({
      supabase,
      onChange: () => {
        void loadTickets();
      },
    });

    return () => {
      void supabase.removeChannel(ticketsChannel);
    };
  }, [supabase, loadTickets]);

  useEffect(() => {
    if (!selectedTicketId) return;

    const messagesChannel = subscribeToTicketMessages({
      supabase,
      ticketId: selectedTicketId,
      onInsert: (payload) => {
        const newMessage = (
          payload as {
            new: SupportMessage;
          }
        ).new;

        setMessages((prev) => {
          if (prev.some((message) => message.id === newMessage.id)) {
            return prev;
          }

          return [...prev, newMessage];
        });

        void loadTickets();
      },
    });

    return () => {
      void supabase.removeChannel(messagesChannel);
    };
  }, [supabase, selectedTicketId, loadTickets]);

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

      <TicketFilters
        search={search}
        status={statusFilter}
        priority={priorityFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      {filteredTickets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <TicketList
            tickets={filteredTickets}
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
          По заданным фильтрам тикеты не найдены
        </div>
      )}
    </div>
  );
}