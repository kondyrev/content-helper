"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import {
  SUPPORT_PRIORITIES,
  SUPPORT_PRIORITY_LABELS,
} from "@/lib/support/constants";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateTicketDialog({
  open,
  onClose,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    try {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject,
          description,
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка создания тикета");
      }

      setSubject("");
      setDescription("");
      setPriority("medium");

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="text-2xl font-bold text-white">
          Новый тикет
        </h2>

        <div className="mt-6 space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема обращения"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите проблему..."
            rows={6}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {SUPPORT_PRIORITIES.map((item) => (
              <option key={item} value={item} className="bg-zinc-900">
                {SUPPORT_PRIORITY_LABELS[item]}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-4 py-2 text-white"
            >
              Отмена
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-2xl bg-violet-500 px-5 py-2 text-white"
            >
              {isLoading ? "Создание..." : "Создать"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}