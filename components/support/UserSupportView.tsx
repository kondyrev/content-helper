"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SupportMessage,
  SupportTicket,
  TicketPriority,
} from "@/lib/support/types";
import {
  subscribeToTicketMessages,
  subscribeToTickets,
} from "@/lib/support/realtime";
import EmptySupportState from "./EmptySupportState";
import CreateTicketButton from "./CreateTicketButton";
import CreateTicketDialog from "./CreateTicketDialog";
import TicketDetails from "./TicketDetails";
import TicketList from "./TicketList";
import UserTicketFilters, {
  matchesUserTicketFilter,
  UserTicketFilter,
} from "./UserTicketFilters";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserTicketFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>(
    "all"
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        ticket.last_message_preview?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = matchesUserTicketFilter(
        statusFilter,
        ticket.status
      );

      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const handleBackToList = useCallback(() => {
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setMessages([]);
  }, []);

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

      const nextTickets = data.tickets || [];

      setTickets(nextTickets);

      setSelectedTicket((prev) => {
        if (!prev) return prev;

        const updatedSelectedTicket = nextTickets.find(
          (ticket: SupportTicket) => ticket.id === prev.id
        );

        return updatedSelectedTicket
          ? { ...prev, ...updatedSelectedTicket }
          : prev;
      });
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

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, unread_count: 0 } : ticket
          )
        );
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

  useEffect(() => {
    if (
      selectedTicketId &&
      filteredTickets.length > 0 &&
      !filteredTickets.some((ticket) => ticket.id === selectedTicketId)
    ) {
      handleBackToList();
    }
  }, [filteredTickets, selectedTicketId, handleBackToList]);

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
        <div className="space-y-4">
          <div className={selectedTicketId ? "hidden lg:block" : "block"}>
            <UserTicketFilters
              search={search}
              status={statusFilter}
              priority={priorityFilter}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
            />
          </div>

          {filteredTickets.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
              <div className={selectedTicketId ? "hidden lg:block" : "block"}>
                <TicketList
                  tickets={filteredTickets}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={loadTicketDetails}
                />
              </div>

              <div className={selectedTicketId ? "block" : "hidden lg:block"}>
                {isDetailsLoading ? (
                  <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
                  </div>
                ) : (
                  <TicketDetails
                    ticket={selectedTicket}
                    messages={messages}
                    currentUserId={currentUserId}
                    onBack={handleBackToList}
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
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
              По заданным фильтрам тикеты не найдены
            </div>
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