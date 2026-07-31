import type { Metadata } from "next";
import { AdminProductsSection } from "./_components/admin-products-section";

export const metadata: Metadata = {
  title: "Quản lý Sản phẩm",
  description: "Danh sách toàn bộ sản phẩm và công cụ thêm sản phẩm mới cho Zenos Hobby Store.",
};

export default function AdminProductsPage() {
  return <AdminProductsSection />;
}
