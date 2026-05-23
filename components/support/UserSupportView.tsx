"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SupportMessage,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "@/lib/support/types";
import EmptySupportState from "./EmptySupportState";
import CreateTicketButton from "./CreateTicketButton";
import CreateTicketDialog from "./CreateTicketDialog";
import TicketDetails from "./TicketDetails";
import TicketList from "./TicketList";
import TicketFilters from "./TicketFilters";

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
                  onMessageCreated={(newMessage) => {
                    setMessages((prev) => [...prev, newMessage]);
                    void loadTickets();
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