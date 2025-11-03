"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CompanyStatus = "new" | "enriched" | "lpr_found" | "intro_generated";

export type Company = {
  id: string;
  name: string;
  project: string;
  website?: string;
  status: CompanyStatus;
  updatedAt: string;
};

export type NewCompanyInput = {
  name: string;
  project: string;
  website?: string;
};

export type AppState = {
  companies: Company[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addCompany: (input: NewCompanyInput) => Company;
  updateStatus: (id: string, status: CompanyStatus) => void;
};

const AUTH_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin@example.com";
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "changeme";
const AUTH_STORAGE_KEY = "outreach-crm-auth";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const initialCompanies: Company[] = [
  {
    id: "cmp-orion",
    name: "ООО Орион",
    project: "DuD",
    website: "https://orion.ru",
    status: "intro_generated",
    updatedAt: "2024-05-25T12:10:00.000Z",
  },
  {
    id: "cmp-vertex",
    name: "Vertex Labs",
    project: "DuD",
    website: "https://vertexlabs.io",
    status: "lpr_found",
    updatedAt: "2024-05-24T15:20:00.000Z",
  },
  {
    id: "cmp-aurora",
    name: "Aurora Media",
    project: "JVO",
    website: "https://aurora.media",
    status: "enriched",
    updatedAt: "2024-05-22T09:05:00.000Z",
  },
  {
    id: "cmp-promo",
    name: "PromoKit",
    project: "PC",
    website: "https://promokit.io",
    status: "new",
    updatedAt: "2024-05-19T08:45:00.000Z",
  },
  {
    id: "cmp-delta",
    name: "Delta Analytics",
    project: "PC",
    website: "https://delta-analytics.ai",
    status: "new",
    updatedAt: "2024-05-17T10:30:00.000Z",
  },
];

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(() => initialCompanies);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === "1") {
      setAuthenticated(true);
    }
  }, []);

  const login = useCallback((email: string, password: string) => {
    const success = email === AUTH_EMAIL && password === AUTH_PASSWORD;
    if (typeof window !== "undefined") {
      if (success) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, "1");
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setAuthenticated(success);
    return success;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setAuthenticated(false);
  }, []);

  const addCompany = useCallback((input: NewCompanyInput) => {
    const company: Company = {
      id: createId(),
      name: input.name,
      project: input.project,
      website: input.website,
      status: "new",
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [company, ...prev]);
    return company;
  }, []);

  const updateStatus = useCallback((id: string, status: CompanyStatus) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id
          ? { ...company, status, updatedAt: new Date().toISOString() }
          : company,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ companies, isAuthenticated, login, logout, addCompany, updateStatus }),
    [companies, isAuthenticated, login, logout, addCompany, updateStatus],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState должен вызываться внутри AppStateProvider");
  }
  return context;
}
