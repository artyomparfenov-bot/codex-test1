import type { ReactNode } from "react";
import { clsx } from "clsx";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="h-2 w-2 animate-ping rounded-full bg-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm opacity-80">{description}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "succeeded"
      ? "bg-emerald-500/10 text-emerald-700"
      : status === "failed"
      ? "bg-rose-500/10 text-rose-700"
      : "bg-slate-500/10 text-slate-600";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        color,
      )}
    >
      {status}
    </span>
  );
}
