"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminOverview } from "@/lib/admin/queries";
import { AdminShell } from "@/components/admin/AdminShell";
import { UsersHeader } from "./UsersHeader";
import { UsersFilters } from "./UsersFilters";
import { UsersTable } from "./UsersTable";

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

export default function AdminUsersPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    async function loadUsers() {
      try {
        const accountData = (await getAdminOverview()) as AccountResponse;

        if (accountData.profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminProfile(accountData.profile);
        setProfiles(accountData.profiles || []);
        setSubscriptions(accountData.subscriptions || []);
      } catch (error) {
        console.error("Admin users load error:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [router]);

  const subscriptionsMap = useMemo(() => {
    return new Map(
      subscriptions.map((item) => [
        item.user_id,
        {
          user_id: item.user_id,
          plan_id: item.plan_id,
          status: item.status,
        },
      ]),
    );
  }, [subscriptions]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return profiles
      .filter((user) => {
        const subscription = subscriptionsMap.get(user.id);
        const plan = subscription?.plan_id || "free";

        const matchesSearch =
          !normalizedSearch ||
          user.email?.toLowerCase().includes(normalizedSearch) ||
          user.id.toLowerCase().includes(normalizedSearch);

        const matchesRole =
          roleFilter === "all" || user.role === roleFilter;

        const matchesPlan =
          planFilter === "all" || plan === planFilter;

        return matchesSearch && matchesRole && matchesPlan;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [
    profiles,
    subscriptionsMap,
    search,
    roleFilter,
    planFilter,
  ]);

  const adminUsersCount = profiles.filter(
    (item) => item.role === "admin",
  ).length;

  const paidUsersCount = subscriptions.filter(
    (item) =>
      item.status === "active" && item.plan_id !== "free",
  ).length;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#070812] px-6 py-6 text-white">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/10" />

        <div className="mt-8 h-[520px] animate-pulse rounded-[28px] bg-white/10" />
      </main>
    );
  }

  if (!adminProfile) {
    return null;
  }

  return (
    <AdminShell adminEmail={adminProfile.email}>
      <div className="space-y-5">
        <UsersHeader
          totalUsers={profiles.length}
          adminUsers={adminUsersCount}
          paidUsers={paidUsersCount}
        />

        <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-2xl">
          <UsersFilters
            search={search}
            roleFilter={roleFilter}
            planFilter={planFilter}
            onSearchChange={setSearch}
            onRoleChange={setRoleFilter}
            onPlanChange={setPlanFilter}
          />

          <UsersTable
            users={filteredUsers}
            subscriptionsMap={subscriptionsMap}
          />
        </section>
      </div>
    </AdminShell>
  );
}