"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-lg px-md bg-surface-container-low z-50">
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
  );
}
