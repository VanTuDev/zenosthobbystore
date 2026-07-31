import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoriesManager } from "./_components/categories-manager";

export const metadata: Metadata = {
  title: "Quản lý Danh mục",
  description: "Sắp xếp và tùy chỉnh các nhóm sản phẩm trong cửa hàng Zenos Hobby Store.",
};

export default function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Quản lý Danh mục"
        description="Sắp xếp và tùy chỉnh các nhóm sản phẩm trong cửa hàng của bạn."
      />

      <CategoriesManager />
    </>
  );
}
