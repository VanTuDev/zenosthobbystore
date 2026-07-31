import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Icon } from "@/components/ui/icon";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Bảng điều khiển quản trị Zenos Hobby Store.",
};

const sections = [
  {
    href: "/admin/products",
    label: "Quản lý Sản phẩm",
    icon: "inventory_2",
    stat: `${products.length} sản phẩm`,
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: "receipt_long",
    stat: "Theo dõi & xử lý đơn hàng",
  },
  {
    href: "/admin/categories",
    label: "Danh mục",
    icon: "category",
    stat: `${categories.length} danh mục`,
  },
  {
    href: "/admin/promotions",
    label: "Tạo mã giảm giá",
    icon: "sell",
    stat: "Phát hành coupon nhanh",
  },
  {
    href: "/admin/finance",
    label: "Tài chính",
    icon: "payments",
    stat: "Doanh thu & giao dịch",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Tổng quan quản trị"
        description={`Quản lý ${products.length} sản phẩm và toàn bộ hoạt động cửa hàng Zenos Hobby.`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-md hover:shadow-xl hover:border-outline-variant transition-all"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-container/10 text-primary mb-md">
              <Icon name={s.icon} />
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{s.label}</h2>
            <p className="text-on-surface-variant font-label-md">{s.stat}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
