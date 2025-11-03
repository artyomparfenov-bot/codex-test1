"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppState, type CompanyStatus } from "@/lib/state";

const STATUS_LABELS: Record<CompanyStatus, string> = {
  new: "Новая",
  enriched: "Обогащена",
  lpr_found: "LPR найден",
  intro_generated: "Интро готово",
};

export default function ClientsPage() {
  const router = useRouter();
  const { isAuthenticated, companies, addCompany, updateStatus, logout } = useAppState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "">("");
  const [form, setForm] = useState({ name: "", project: "", website: "" });

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = search
        ? company.name.toLowerCase().includes(search.toLowerCase()) ||
          company.project.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesStatus = statusFilter ? company.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Введите название клиента");
      return;
    }
    addCompany({
      name: form.name.trim(),
      project: form.project.trim() || "Основной",
      website: form.website.trim() || undefined,
    });
    toast.success("Клиент добавлен", { description: form.name });
    setForm({ name: "", project: "", website: "" });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-10">
      <header className="flex flex-col gap-4 border-b pb-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Клиенты</h1>
            <p className="text-sm text-muted-foreground">
              Следите за статусом общения и обновляйте данные после действий аутрич-команды.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="self-start rounded border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Выйти
          </button>
        </div>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Название"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Проект"
            value={form.project}
            onChange={(event) => setForm((prev) => ({ ...prev, project: event.target.value }))}
          />
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Сайт"
            value={form.website}
            onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
          />
          <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Добавить
          </button>
        </form>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
          <input
            className="w-full rounded border px-3 py-2 text-sm md:w-64"
            placeholder="Поиск по названию или проекту"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="w-full rounded border px-3 py-2 text-sm md:w-48"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as CompanyStatus | "")}
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-muted-foreground">Всего: {filtered.length}</span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Проект</th>
              <th className="px-4 py-3 font-medium">Сайт</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Последнее обновление</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr key={company.id} className="border-t">
                <td className="px-4 py-3 font-medium text-slate-900">{company.name}</td>
                <td className="px-4 py-3 text-slate-600">{company.project}</td>
                <td className="px-4 py-3 text-slate-600">
                  {company.website ? (
                    <a href={company.website} className="text-emerald-600 underline" target="_blank" rel="noreferrer">
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded border px-2 py-1 text-xs"
                    value={company.status}
                    onChange={(event) => {
                      updateStatus(company.id, event.target.value as CompanyStatus);
                      toast.success("Статус обновлён", { description: STATUS_LABELS[event.target.value as CompanyStatus] });
                    }}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(company.updatedAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Нет клиентов, удовлетворяющих условиям поиска.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
