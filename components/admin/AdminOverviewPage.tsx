"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import { AdminShell } from "./AdminShell";
import { AdminOverviewHero } from "./AdminOverviewHero";
import { AdminMetricsGrid } from "./AdminMetricsGrid";
import { AdminRevenueChart } from "./AdminRevenueChart";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { SupportInboxPanel } from "./SupportInboxPanel";
import { UsersPreviewTable } from "./UsersPreviewTable";

type Profile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type Subscription = {
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  plans: {
    id: string;
    name: string;
    daily_limit: number;
    price_month: number;
  } | null;
};

type AccountResponse = {
  profile: Profile;
  profiles: Profile[];
  subscriptions: Subscription[];
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/");
          return;
        }

        const response = await fetch("/api/account/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || data?.error) {
          router.replace("/");
          return;
        }

        const accountData = data as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);
      } catch (error) {
        console.error("Admin load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdmin();
  }, [router, supabase]);

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active" && item.plan_id !== "free",
  );

  const freeCount = subscriptions.filter(
    (item) => item.plan_id === "free",
  ).length;

  const creatorCount = subscriptions.filter(
    (item) => item.plan_id === "creator",
  ).length;

  const smmProCount = subscriptions.filter(
    (item) => item.plan_id === "smm_pro",
  ).length;

  const estimatedMonthlyRevenue = subscriptions.reduce((sum, item) => {
    if (item.status !== "active") return sum;
    return sum + (item.plans?.price_month || 0);
  }, 0);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-3xl bg-white/10"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AdminShell adminEmail={profile.email}>
      <div className="space-y-5">
        <AdminOverviewHero />

        <AdminMetricsGrid
          profilesCount={profiles.length}
          activeSubscriptions={activeSubscriptions.length}
          estimatedRevenue={estimatedMonthlyRevenue}
          freeCount={freeCount}
          creatorCount={creatorCount}
          smmProCount={smmProCount}
        />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
          <AdminRevenueChart
            revenue={estimatedMonthlyRevenue}
            activeSubscriptions={activeSubscriptions.length}
          />

          <div className="space-y-5">
            <RecentActivityPanel
              usersCount={profiles.length}
              activeSubscriptions={activeSubscriptions.length}
            />

            <SupportInboxPanel />
          </div>
        </div>

        <UsersPreviewTable
          profiles={profiles}
          subscriptions={subscriptions}
        />
      </div>
    </AdminShell>
  );
}