import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

type AdminShellProps = {
  children: ReactNode;
  adminEmail: string | null;
};

export function AdminShell({ children, adminEmail }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#070812] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.16),transparent_30%)]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <section className="min-w-0 px-4 pb-8 pt-4 sm:px-6 lg:px-7">
          <AdminTopbar email={adminEmail} />
          {children}
        </section>
      </div>
    </main>
  );
}