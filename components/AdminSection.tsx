type AdminProfile = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
};

type AdminSectionProps = {
  isAdmin: boolean;
  profiles: AdminProfile[];
  onChangeRole: (
  userId: string,
  role: "user" | "admin"
) => void;
};

export function AdminSection({
  isAdmin,
  profiles,
  onChangeRole,
}: AdminSectionProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <section id="admin" className="scroll-mt-8 mt-20">
      <div className="mb-6">
        <h2 className="text-4xl font-black">Админка</h2>

        <p className="mt-2 text-gray-400">
          Управление пользователями, тарифами и лимитами.
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
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div>
                  <p className="font-bold">
                    {profile.email || "Без email"}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(profile.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    profile.role === "admin"
                      ? "bg-violet-400/10 text-violet-200"
                      : "bg-cyan-400/10 text-cyan-200"
                  }`}
                >
                  {profile.role}
                </span>

                  <div className="flex gap-2">
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}