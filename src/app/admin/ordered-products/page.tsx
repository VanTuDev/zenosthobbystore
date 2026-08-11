import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderedProductsManager } from "../promotions/_components/ordered-products-manager";

export const metadata: Metadata = {
  title: "Sản phẩm đang order",
  description: "Thống kê sản phẩm và biến thể đang được khách đặt.",
};

export default function AdminOrderedProductsPage() {
  return (
    <>
      <AdminPageHeader title="Sản phẩm đang order" description="Theo dõi sản phẩm, biến thể, số đơn và tổng số lượng cần đặt." />
      <OrderedProductsManager />
    </>
  );
}
