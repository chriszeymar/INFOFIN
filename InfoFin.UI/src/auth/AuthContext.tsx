import { createContext, useContext, useMemo, useState } from "react";
import { httpClient } from "../api/httpClient";

// v0-compatible role type
export type Role =
  | "Admin"
  | "Financial Analyst"
  | "FPA Reviewer"
  | "FPA Approver";

export const ROLES: Role[] = [
  "Admin",
  "Financial Analyst",
  "FPA Reviewer",
  "FPA Approver",
];

const ELEVATED_ROLES: Role[] = [
  "Admin",
  "FPA Reviewer",
  "FPA Approver",
];

function mapBackendRole(backendRole: string): Role {
  const r = backendRole.toLowerCase();
  if (r.includes("admin")) return "Admin";
  if (r.includes("analyst")) return "Financial Analyst";
  if (r.includes("reviewer")) return "FPA Reviewer";
  if (r.includes("approver")) return "FPA Approver";
  return "Financial Analyst";
}

type UserToken = {
  userId: number;
  email: string;
  name: string;
  role: Role;
  backendRole: string;
  departmentId?: number;
  accessToken: string;
  isElevated: boolean;
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  userId: number;
  role: string;
  departmentId?: number;
};

type AuthContextValue = {
  user: UserToken | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "infofin_user_token";
const TOKEN_STORAGE_KEY = "infofin_access_token";

function readStoredUser(): UserToken | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserToken;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserToken | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: !!user,
      async login(request: LoginRequest) {
        const response = await httpClient.post<LoginResponse>("/api/auth/login", request);
        const payload = response.data;

        const frontendRole = mapBackendRole(payload.role);

        const nextUser: UserToken = {
          userId: payload.userId,
          email: request.email,
          name: request.email.split("@")[0].replace(/\./g, ' '),
          role: frontendRole,
          backendRole: payload.role,
          departmentId: payload.departmentId,
          accessToken: payload.accessToken,
          isElevated: ELEVATED_ROLES.includes(frontendRole),
        };

        localStorage.setItem(TOKEN_STORAGE_KEY, payload.accessToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

// v0-compatible hook alias
export function useSession() {
  const { user, logout } = useAuth();
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "Financial Analyst" as Role,
    isElevated: user?.isElevated ?? false,
    logout,
  };
}
