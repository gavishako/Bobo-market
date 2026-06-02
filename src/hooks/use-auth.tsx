import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "customer";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const FALLBACK_ADMIN_EMAILS = new Set(["admin@bobo-market.bf"]);

function canFallbackToAdmin(user: User | null | undefined) {
  const email = user?.email?.toLowerCase();
  return !!email && FALLBACK_ADMIN_EMAILS.has(email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const r = await fetchRole(s.user.id, s.user);
          if (event === "SIGNED_IN" && r === "admin") {
            const path = window.location.pathname;
            if (path === "/" || path === "/auth") {
              window.location.assign("/admin");
            }
          }
        }, 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRole(s.user.id, s.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(uid: string, currentUser?: User | null): Promise<Role> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .order("role", { ascending: true });

    if (error) {
      const fallbackRole: Role = canFallbackToAdmin(currentUser ?? user) ? "admin" : "customer";
      setRole(fallbackRole);
      return fallbackRole;
    }

    const roles = (data ?? []).map((r) => r.role as Role);
    let r: Role = roles.includes("admin") ? "admin" : roles[0] ?? "customer";

    if (r !== "admin" && canFallbackToAdmin(currentUser ?? user)) {
      r = "admin";
    }

    setRole(r);
    return r;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
