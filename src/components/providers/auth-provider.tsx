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
import { API_BASE_URL } from "@/lib/config";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthLoading: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ user: AuthUser }>("/auth/me")
      .then((body) => {
        if (!cancelled) setUser(body.user);
      })
      .catch((err) => {
        // A 401 here just means "not logged in" — expected for anonymous visitors.
        if (!(err instanceof ApiRequestError && err.status === 401)) {
          console.error("Không thể tải phiên đăng nhập:", err);
        }
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithGoogle = useCallback(() => {
    setIsLoggingIn(true);
    window.location.href = `${API_BASE_URL}/auth/google`;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    apiFetch("/auth/logout", { method: "POST" }).catch((err) => {
      console.error("Đăng xuất thất bại:", err);
    });
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      isLoggingIn,
      loginWithGoogle,
      logout,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
    }),
    [user, isAuthLoading, isLoggingIn, loginWithGoogle, logout, isLoginModalOpen, openLoginModal, closeLoginModal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
