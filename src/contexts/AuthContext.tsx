import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import {
  signIn,
  signOut,
  signUp,
  sendPasswordResetEmail,
  updatePassword,
  getCurrentUserProfile,
} from "@/services/supabase/auth";

// ============================================================
// CONTEXT TYPES
// ============================================================

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const p = await getCurrentUserProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      await signUp(email, password, fullName, phone);
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(email);
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    await updatePassword(newPassword);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const value: AuthContextValue = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === "admin",
    isCitizen: profile?.role === "citizen",
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
