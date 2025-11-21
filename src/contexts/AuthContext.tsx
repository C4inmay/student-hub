import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import { AuthUser, UserRole } from "@/types/auth";

type AuthResponse = { success: boolean; error?: string };

interface RegistrationPayload {
  email: string;
  password: string;
  role?: UserRole;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: RegistrationPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const DEMO_USERS: Record<string, { password: string; role: UserRole; name: string }> = {
  "admin@gmail.com": {
    password: "admin123",
    role: "admin",
    name: "Admin Reviewer",
  },
  "chinmay@gmail.com": {
    password: "chinmay123",
    role: "student",
    name: "Chinmay",
  },
};

const DEMO_STORAGE_KEY = "student-hub:demo-session";

const loadDemoUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const persistDemoUser = (value: AuthUser | null) => {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(value));
  } else {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  }
};

const mapSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
  const metadata = supabaseUser.user_metadata ?? {};
  const role = (metadata.role as UserRole) ?? "student";
  const name = (metadata.name as string) ?? supabaseUser.email?.split("@")[0];

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    role,
    name,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        console.error("Failed to fetch Supabase session", error);
        setUser(loadDemoUser());
      } else if (data.session?.user) {
        persistDemoUser(null);
        setUser(mapSupabaseUser(data.session.user));
      } else {
        setUser(loadDemoUser());
      }
      setIsLoading(false);
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        persistDemoUser(null);
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(loadDemoUser());
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS[normalizedEmail];

    if (demoUser) {
      if (password !== demoUser.password) {
        return { success: false, error: "Incorrect password for demo account" };
      }
      const authUser: AuthUser = {
        id: `demo-${normalizedEmail}`,
        email: normalizedEmail,
        role: demoUser.role,
        name: demoUser.name,
      };
      setUser(authUser);
      persistDemoUser(authUser);
      return { success: true };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const register = async ({ email, password, role = "student", name }: RegistrationPayload): Promise<AuthResponse> => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS[normalizedEmail];

    if (demoUser) {
      if (password !== demoUser.password) {
        return {
          success: false,
          error: `Demo account uses the password "${demoUser.password}"`,
        };
      }

      const authUser: AuthUser = {
        id: `demo-${normalizedEmail}`,
        email: normalizedEmail,
        role: demoUser.role,
        name: demoUser.name,
      };
      setUser(authUser);
      persistDemoUser(authUser);
      return { success: true };
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          role,
          name,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      const lowered = error.message.toLowerCase();
      const isDuplicate = lowered.includes("already registered") || lowered.includes("invalid") || lowered.includes("exists");
      return {
        success: false,
        error: isDuplicate
          ? "Account already exists. Sign in instead."
          : error.message,
      };
    }

    return { success: true };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signOut error", error);
    }
    persistDemoUser(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
