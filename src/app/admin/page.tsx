import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDashboardSection } from "./_components/admin-dashboard-section";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Bảng điều khiển quản trị Zenos Hobby Store.",
};

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Tổng quan quản trị"
        description="Quản lý toàn bộ hoạt động cửa hàng Zenos Hobby."
      />
      <AdminDashboardSection />
    </>
  );
}
