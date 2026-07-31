"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";

/**
 * Gates every /admin route behind the same session cookie the storefront
 * already uses (one Google login covers both — no separate admin sign-in).
 * Anonymous visitors get the login modal; logged-in non-admins get bounced
 * home with a toast. The backend still enforces role on every write, this
 * just avoids flashing the admin shell at people who can't use it.
 */
export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { user, isAuthLoading, openLoginModal } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthLoading || hasRedirected.current) return;

    if (!user) {
      hasRedirected.current = true;
      router.replace("/");
      openLoginModal();
      return;
    }

    if (user.role !== "ADMIN") {
      hasRedirected.current = true;
      showToast("Bạn không có quyền truy cập trang quản trị.", "error");
      router.replace("/");
    }
  }, [isAuthLoading, user, router, openLoginModal, showToast]);

  if (isAuthLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Icon name="progress_activity" className="animate-spin text-primary !text-[32px]" />
      </div>
    );
  }

  return <>{children}</>;
}
