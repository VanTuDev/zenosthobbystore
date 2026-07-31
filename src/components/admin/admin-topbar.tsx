"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";

export function AdminTopbar({ searchPlaceholder = "Tìm kiếm trong Zenos Admin..." }: { searchPlaceholder?: string }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
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
    <header className="flex justify-between items-center h-16 ml-64 px-margin-mobile md:px-margin-desktop w-[calc(100%-16rem)] sticky top-0 bg-surface z-40 border-b border-outline-variant/20">
      <div className="flex items-center flex-1 max-w-144">
        <div className="relative w-full">
          <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Icon name="search" />
          </span>
          <label htmlFor="admin-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <input
            id="admin-search"
            className="w-full bg-surface-container border-none rounded-lg py-xs pl-10 pr-base focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative p-xs text-on-surface-variant hover:text-primary transition-opacity"
        >
          <Icon name="notifications" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {user && (
          <div className="relative" ref={rootRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Tài khoản quản trị"
              aria-haspopup="menu"
              aria-expanded={open}
              className="block hover:opacity-80 transition-opacity active:scale-95"
            >
              <UserAvatar avatarUrl={user.avatarUrl} initials={user.initials} size={32} />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-sm w-64 rounded-xl bg-white shadow-2xl border border-outline-variant/30 overflow-hidden z-50"
              >
                <div className="flex items-center gap-sm p-md bg-surface-container-low">
                  <UserAvatar avatarUrl={user.avatarUrl} initials={user.initials} size={40} />
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface truncate">{user.name}</p>
                    <p className="font-body-md text-[13px] text-on-surface-variant truncate">{user.email}</p>
                  </div>
                </div>
                <div className="p-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logout();
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
        )}
      </div>
    </header>
  );
}
