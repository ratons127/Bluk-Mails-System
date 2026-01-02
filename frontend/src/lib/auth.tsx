import React, { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export type Role =
  | "SUPER_ADMIN"
  | "HR_ADMIN"
  | "DEPT_ADMIN"
  | "APPROVER"
  | "AUDITOR"
  | "SENDER";

export type AuthUser = {
  email: string;
  name?: string;
  roles: Role[];
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loginWithToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "bulk_email_token";
const KNOWN_ROLES = new Set([
  "SUPER_ADMIN",
  "HR_ADMIN",
  "DEPT_ADMIN",
  "APPROVER",
  "AUDITOR",
  "SENDER"
]);

function normalizeRole(value: string): Role | null {
  const trimmed = value.replace(/^ROLE_/, "").replace(/^\//, "");
  const candidate = trimmed.split("/").pop() || trimmed;
  const upper = candidate.toUpperCase();
  return KNOWN_ROLES.has(upper) ? (upper as Role) : null;
}

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    const roles = new Set<string>();
    const directRoles = (decoded.roles || []) as string[];
    const realmRoles = (decoded.realm_access?.roles || []) as string[];
    const groupRoles = (decoded.groups || []) as string[];
    const resourceAccess = decoded.resource_access || {};
    const resourceRoles = Object.values(resourceAccess).flatMap((entry: any) => entry?.roles || []);
    [...directRoles, ...realmRoles, ...groupRoles, ...resourceRoles].forEach((role) => {
      if (typeof role === "string") roles.add(role);
    });
    const mappedRoles = Array.from(roles)
      .map((role) => normalizeRole(role))
      .filter(Boolean) as Role[];
    return {
      email: decoded.email || decoded.preferred_username || decoded.sub || "unknown",
      name: decoded.name || decoded.preferred_username,
      roles: mappedRoles
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const user = useMemo(() => (token ? parseJwt(token) : null), [token]);

  const loginWithToken = (nextToken: string) => {
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthProvider missing");
  }
  return ctx;
}

export function hasRole(user: AuthUser | null, roles: Role[]) {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return roles.some((role) => user.roles.includes(role));
}
