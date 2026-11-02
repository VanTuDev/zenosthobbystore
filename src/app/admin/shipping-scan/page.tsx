import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingLabelScanner } from "./_components/shipping-label-scanner";

export const metadata: Metadata = {
  title: "Quét nhãn vận đơn",
  description: "Đối chiếu nhãn giao hàng và cập nhật mã vận đơn cho đơn hàng.",
};

export default function ShippingScanPage() {
  return (
    <>
      <AdminPageHeader
        title="Quét nhãn vận đơn"
        description="Chụp nhãn SPX để tìm đúng đơn hàng, lưu mã vận đơn và chuyển sang đã vận chuyển."
      />
      <ShippingLabelScanner />
    </>
  );
}
