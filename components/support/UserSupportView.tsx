"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import { SupportTicket } from "@/lib/support/types";
import EmptySupportState from "./EmptySupportState";
import CreateTicketButton from "./CreateTicketButton";
import CreateTicketDialog from "./CreateTicketDialog";
import TicketList from "./TicketList";

export default function UserSupportView() {
  const supabase = useMemo(() => createClient(), []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch("/api/support/tickets", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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
  }, [supabase]);

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
        <TicketList tickets={tickets} />
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