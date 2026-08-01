import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PromotionsManager } from "./_components/promotions-manager";

export const metadata: Metadata = {
  title: "Tạo mã giảm giá",
  description: "Phát hành và quản lý mã giảm giá (coupon) cho Zenos Hobby Store.",
};

export default function AdminPromotionsPage() {
  return (
    <>
      <AdminPageHeader
        title="Tạo mã giảm giá"
        description="Phát hành coupon giảm giá nhanh và theo dõi toàn bộ mã đang hoạt động."
      />

      <PromotionsManager />
    </>
  );
}
