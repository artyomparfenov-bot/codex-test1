"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppState } from "@/lib/state";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/clients");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const ok = login(email, password);
    if (ok) {
      toast.success("Добро пожаловать!");
      router.replace("/clients");
    } else {
      toast.error("Неверные данные входа");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white/5 p-8 shadow-xl backdrop-blur">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Outreach CRM</h1>
          <p className="text-sm text-slate-200">
            Используйте демо-доступ для проверки интерфейса управления клиентами.
          </p>
        </header>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-1 text-left text-sm">
            <span className="block text-slate-200">Email</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-left text-sm">
            <span className="block text-slate-200">Пароль</span>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
              type="password"
              autoComplete="current-password"
              required
              placeholder="changeme"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            Войти
          </button>
        </form>
        <p className="text-center text-xs text-slate-300">
          Demo: <span className="font-medium">admin@example.com / changeme</span>
        </p>
        <p className="text-center text-xs text-slate-400">
          После входа вы увидите <Link href="/clients" className="underline">список клиентов</Link> и сможете обновлять статусы.
        </p>
      </div>
    </div>
  );
}
