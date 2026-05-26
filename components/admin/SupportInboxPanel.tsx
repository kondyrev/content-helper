export function SupportInboxPanel() {
  const tickets = [
    {
      title: "Support tickets подключим следующим этапом",
      meta: "support_tickets + support_messages",
      priority: "high",
      time: "soon",
    },
    {
      title: "Unread counters через Supabase realtime",
      meta: "новые сообщения пользователей",
      priority: "medium",
      time: "soon",
    },
    {
      title: "Assignment / priority / status",
      meta: "admin workflow",
      priority: "low",
      time: "soon",
    },
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold">Support Inbox</div>
          <div className="mt-1 text-xs text-slate-500">
            Тикеты, требующие внимания
          </div>
        </div>

        <span className="rounded-full border border-violet-400/20 bg-violet-500/15 px-2 py-1 text-[11px] font-bold text-violet-200">
          soon
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.title}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4 py-3"
          >
            <div>
              <div className="text-sm font-bold text-slate-200">
                {ticket.title}
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    ticket.priority === "high"
                      ? "bg-rose-400"
                      : ticket.priority === "medium"
                        ? "bg-amber-300"
                        : "bg-emerald-400"
                  }`}
                />
                {ticket.meta}
              </div>
            </div>

            <div className="text-xs text-slate-600">{ticket.time}</div>
          </div>
        ))}
      </div>
    </section>
  );
}