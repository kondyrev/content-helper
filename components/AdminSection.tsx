type AdminProfile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type AdminSubscription = {
  user_id: string;
  plan_id: string;
  status: string;
  plans: {
    id: string;
    name: string;
    daily_limit: number;
    price_month: number;
  } | null;
};

type AdminSectionProps = {
  isAdmin: boolean;
  profiles: AdminProfile[];
  subscriptions: AdminSubscription[];
  onChangeRole: (userId: string, role: "user" | "admin") => void;
  onChangePlan: (
    userId: string,
    planId: "free" | "creator" | "smm_pro"
  ) => void;
};

export function AdminSection({
  isAdmin,
  profiles,
  subscriptions,
  onChangeRole,
  onChangePlan,
}: AdminSectionProps) {
  if (!isAdmin) {
    return null;
  }

  function getUserPlan(userId: string) {
    return subscriptions.find((item) => item.user_id === userId);
  }

  return (
    <section id="admin" className="scroll-mt-8 mt-20">
      <div className="mb-6">
        <h2 className="text-4xl font-black">Админка</h2>

        <p className="mt-2 text-gray-400">
          Управление пользователями, ролями и тарифами.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">Пользователи</h3>

          <span className="rounded-full bg-violet-400/10 px-3 py-1 text-sm text-violet-200">
            {profiles.length} всего
          </span>
        </div>

        {profiles.length === 0 ? (
          <p className="text-gray-400">Пользователи пока не загружены.</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => {
              const subscription = getUserPlan(profile.id);
              const currentPlanId = subscription?.plan_id || "free";
              const currentPlanName = subscription?.plans?.name || "Free";

              return (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">
                        {profile.email || "Без email"}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {new Date(profile.created_at).toLocaleString("ru-RU")}
                      </p>

                      <p className="mt-2 text-sm text-gray-300">
                        Тариф:{" "}
                        <span className="font-bold text-cyan-200">
                          {currentPlanName}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-2 text-sm font-bold ${
                          profile.role === "admin"
                            ? "bg-violet-400/10 text-violet-200"
                            : "bg-cyan-400/10 text-cyan-200"
                        }`}
                      >
                        {profile.role}
                      </span>

                      {profile.role === "admin" ? (
                        <button
                          onClick={() => onChangeRole(profile.id, "user")}
                          className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-400/20"
                        >
                          Сделать user
                        </button>
                      ) : (
                        <button
                          onClick={() => onChangeRole(profile.id, "admin")}
                          className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-400/20"
                        >
                          Сделать admin
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onChangePlan(profile.id, "free")}
                      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                        currentPlanId === "free"
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      Free
                    </button>

                    <button
                      onClick={() => onChangePlan(profile.id, "creator")}
                      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                        currentPlanId === "creator"
                          ? "bg-cyan-300 text-black"
                          : "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                      }`}
                    >
                      Creator
                    </button>

                    <button
                      onClick={() => onChangePlan(profile.id, "smm_pro")}
                      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                        currentPlanId === "smm_pro"
                          ? "bg-violet-300 text-black"
                          : "border border-violet-300/20 bg-violet-300/10 text-violet-100 hover:bg-violet-300/20"
                      }`}
                    >
                      SMM Pro
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}