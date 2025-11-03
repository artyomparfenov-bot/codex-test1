import type { Metadata } from "next";
import "../styles/globals.css";
import { ReactNode } from "react";
import { ClientRoot } from "./client-root";

export const metadata: Metadata = {
  title: "Outreach CRM",
  description: "Мини-приложение для управления лидами",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
