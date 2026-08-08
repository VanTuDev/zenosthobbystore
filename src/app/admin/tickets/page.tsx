import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTicketsSection } from "./_components/admin-tickets-section";

export const metadata: Metadata = {
  title: "Ticket liên hệ",
  description: "Yêu cầu hỗ trợ khách hàng gửi từ trang Liên hệ trên website.",
};

export default function AdminTicketsPage() {
  return (
    <>
      <AdminPageHeader
        title="Ticket liên hệ"
        description="Yêu cầu hỗ trợ khách hàng gửi từ form Liên hệ trên website."
      />

      <AdminTicketsSection />
    </>
  );
}
