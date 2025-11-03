import type { ReactNode } from "react";

export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
      <header>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}
