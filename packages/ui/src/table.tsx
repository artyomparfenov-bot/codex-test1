import type { ReactNode } from "react";
import { clsx } from "clsx";

export function DataTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) {
    return <div className="rounded-md border border-dashed p-6 text-center text-sm">{empty}</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {rows.map((row, idx) => (
            <tr key={idx} className={clsx(idx % 2 === 0 ? "" : "bg-muted/30")}> 
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
