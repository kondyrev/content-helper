"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase";
import SupportHeader from "./SupportHeader";
import UserSupportView from "./UserSupportView";
import AdminSupportView from "./AdminSupportView";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type AccountResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: Profile;
};

export default function SupportPage() {
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    async function loadAccount() {
      try {
        setIsLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("Для доступа к поддержке нужно войти в аккаунт.");
          return;
        }

        const response = await fetch("/api/account/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Не удалось загрузить аккаунт");
        }

        setProfile((data as AccountResponse).profile);
      } catch (error) {
        console.error("Support account load error:", error);
        setError("Не удалось загрузить данные аккаунта.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAccount();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl transition hover:border-violet-400/40 hover:bg-white/[0.07] hover:text-white"
          >
            <span>←</span>
            Вернуться в Dashboard
          </Link>

          <SupportHeader />
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-100">
            {error}
          </div>
        ) : isAdmin ? (
          <AdminSupportView />
        ) : (
          <UserSupportView />
        )}
      </div>
    </div>
  );
}