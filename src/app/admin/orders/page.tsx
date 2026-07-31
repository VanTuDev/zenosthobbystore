import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminOrdersSection } from "./_components/admin-orders-section";

export const metadata: Metadata = {
  title: "Đơn hàng",
  description: "Theo dõi và xử lý đơn hàng của khách tại Zenos Hobby Store.",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Đơn hàng"
        description="Theo dõi trạng thái xử lý, giao hàng và thanh toán của toàn bộ đơn hàng."
      />

      <AdminOrdersSection />
    </>
  );
}
