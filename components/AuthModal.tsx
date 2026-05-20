"use client";

import { useState } from "react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailAuth: (
    email: string,
    password: string,
    mode: "login" | "register"
  ) => Promise<void>;
};

export function AuthModal({
  isOpen,
  onClose,
  onGoogleLogin,
  onEmailAuth,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit() {
    if (!email || !password) {
      return;
    }

    try {
      setIsLoading(true);

      await onEmailAuth(email, password, mode);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020] p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white">
              {mode === "login" ? "Вход" : "Регистрация"}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Добро пожаловать в Content Helper
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-white transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-400/40"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-400/40"
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading
              ? "Загрузка..."
              : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
          </button>

          <div className="relative py-2 text-center text-sm text-gray-500">
            <span className="bg-[#0b1020] px-3">или</span>
          </div>

          <button
            onClick={onGoogleLogin}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white transition hover:bg-white/10"
          >
            Войти через Google
          </button>
        </div>

        <button
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
          className="mt-6 text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}