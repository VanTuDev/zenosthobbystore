"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { RecentlyViewedProvider } from "@/components/providers/recently-viewed-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { LoginModal } from "@/components/store/login-modal";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <FavoritesProvider>
            <CartProvider>
              <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
            </CartProvider>
          </FavoritesProvider>
          <LoginModal />
        </ConfirmDialogProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
