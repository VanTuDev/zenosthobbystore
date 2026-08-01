"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { fetchProducts } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { fetchOrders } from "@/lib/api/orders";
import { fetchFinanceStats } from "@/lib/api/finance";
import { formatVnd } from "@/lib/format";

const BASE_SECTIONS = [
  { href: "/admin/products", label: "Quản lý Sản phẩm", icon: "inventory_2" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "receipt_long" },
  { href: "/admin/categories", label: "Danh mục", icon: "category" },
  { href: "/admin/promotions", label: "Tạo mã giảm giá", icon: "sell" },
  { href: "/admin/finance", label: "Tài chính", icon: "payments" },
] as const;

export function AdminDashboardSection() {
  const [counts, setCounts] = useState<{
    products: number;
    categories: number;
    orders: number;
    revenue30d: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchProducts({ pageSize: 1 }),
      fetchCategories(),
      fetchOrders({ pageSize: 1 }),
      fetchFinanceStats({ days: 30 }),
    ])
      .then(([products, categories, orders, stats]) => {
        if (cancelled) return;
        setCounts({
          products: products.pagination.total,
          categories: categories.length,
          orders: orders.pagination.total,
          revenue30d: stats.totals.totalRevenue,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const statFor: Record<(typeof BASE_SECTIONS)[number]["href"], string> = {
    "/admin/products": counts ? `${counts.products} sản phẩm` : "Đang tải…",
    "/admin/orders": counts ? `${counts.orders} đơn hàng` : "Đang tải…",
    "/admin/categories": counts ? `${counts.categories} danh mục` : "Đang tải…",
    "/admin/promotions": "Phát hành coupon nhanh",
    "/admin/finance": counts ? `Doanh thu 30 ngày: ${formatVnd(counts.revenue30d)}` : "Đang tải…",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
      {BASE_SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-md hover:shadow-xl hover:border-outline-variant transition-all"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-container/10 text-primary mb-md">
            <Icon name={s.icon} />
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{s.label}</h2>
          <p className="text-on-surface-variant font-label-md">{statFor[s.href]}</p>
        </Link>
      ))}
    </div>
  );
}
