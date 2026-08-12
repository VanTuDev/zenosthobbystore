"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Quản lý Sản phẩm", icon: "inventory_2" },
  { href: "/admin/orders", label: "Đơn Facebook", icon: "receipt_long" },
  { href: "/admin/tickets", label: "Ticket liên hệ", icon: "support_agent" },
  { href: "/admin/ordered-products", label: "Sản phẩm đang order", icon: "inventory" },
  { href: "/admin/categories", label: "Danh mục", icon: "category" },
  { href: "/admin/finance", label: "Tài chính", icon: "payments" },
  { href: "/admin/users", label: "Người dùng", icon: "group" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-on-surface shadow-sm ring-1 ring-outline-variant/30 lg:hidden"
        aria-label="Mở menu quản trị"
      >
        <Icon name="menu" />
      </button>
      {open && <button type="button" className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu quản trị" />}
      <aside className={`fixed left-0 top-0 z-[60] flex h-dvh w-[min(18rem,85vw)] flex-col overflow-y-auto bg-surface-container-low px-md py-lg shadow-xl transition-transform lg:z-50 lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden" aria-label="Đóng menu"><Icon name="close" /></button>
      <div className="mb-lg px-sm">
        <p className="font-headline-md text-headline-md font-bold text-on-surface">Zenost Hobby Store</p>
        <p className="text-on-surface-variant font-label-md">Bảng điều khiển Admin</p>
      </div>
      <nav className="flex-1 space-y-base" aria-label="Điều hướng quản trị">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex items-center gap-sm px-sm py-base rounded-lg text-primary font-bold border-r-4 border-primary bg-primary-container/10 transition-colors duration-200"
                  : "flex items-center gap-sm px-sm py-base rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              }
            >
              <Icon name={item.icon} />
              <span className="font-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-base pt-lg border-t border-outline-variant">
        <Link
          className="flex items-center gap-sm px-sm py-base rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
          href="#"
        >
          <Icon name="settings" />
          <span className="font-label-md">Cài đặt</span>
        </Link>
        <Link
          className="flex items-center gap-sm px-sm py-base rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
          href="#"
        >
          <Icon name="help" />
          <span className="font-label-md">Hỗ trợ</span>
        </Link>
      </div>
      </aside>
    </>
  );
}
