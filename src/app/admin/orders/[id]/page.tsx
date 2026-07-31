import type { Metadata } from "next";
import { AdminOrderDetailView } from "./_components/admin-order-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Đơn hàng ${id.slice(-8).toUpperCase()}` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetailView orderId={id} />;
}
