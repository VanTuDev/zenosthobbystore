"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";

export function UserMenu() {
  const { user, openLoginModal, logout } = useAuth();
  const { favoriteIds } = useFavorites();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => (user ? setOpen((v) => !v) : openLoginModal())}
        aria-label="Tài khoản của tôi"
        aria-haspopup={user ? "menu" : undefined}
        aria-expanded={user ? open : undefined}
        className="flex items-center gap-xs text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
      >
        {user ? (
          <UserAvatar avatarUrl={user.avatarUrl} initials={user.initials} size={32} />
        ) : (
          <Icon name="person" />
        )}
      </button>

      {open && user && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-sm w-72 rounded-xl bg-white shadow-2xl border border-outline-variant/30 overflow-hidden z-50"
        >
          <div className="flex items-center gap-sm p-md bg-surface-container-low">
            <UserAvatar avatarUrl={user.avatarUrl} initials={user.initials} size={44} />
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate">
                {user.name}
              </p>
              <p className="font-body-md text-[13px] text-on-surface-variant truncate">
                {user.email}
              </p>
            </div>
          </div>
          <nav className="p-xs" aria-label="Tài khoản">
            <Link
              href="/giao-hang-bao-hanh"
              onClick={() => setOpen(false)}
              className="flex items-center gap-sm px-sm py-base rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="receipt_long" className="text-on-surface-variant" />
              <span className="font-label-md text-label-md">Đơn hàng của tôi</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-sm px-sm py-base rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Icon name="favorite" className="text-on-surface-variant" />
              <span className="font-label-md text-label-md">
                Sản phẩm yêu thích{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}
              </span>
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-sm px-sm py-base rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <Icon name="admin_panel_settings" className="text-on-surface-variant" />
                <span className="font-label-md text-label-md">Trang quản trị</span>
              </Link>
            )}
          </nav>
          <div className="p-xs border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-sm px-sm py-base rounded-lg text-error hover:bg-error-container/30 transition-colors"
            >
              <Icon name="logout" />
              <span className="font-label-md text-label-md">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
