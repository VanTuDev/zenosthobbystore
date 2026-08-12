import { Badge } from "@/components/ui/badge";
import type { ApiOrder } from "@/lib/api-types";

export const ORDER_STATUS_META: Record<
  ApiOrder["status"],
  { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }
> = {
  packing: { label: "Đang đóng hàng", tone: "outline" },
  deposit_received: { label: "Đã nhận đặt cọc", tone: "outline" },
  factory_ordered: { label: "Đã đặt hàng với xưởng", tone: "outline" },
  factory_shipped: { label: "Xưởng trả hàng", tone: "outline" },
  transit_warehouse: { label: "Hàng về kho trung chuyển", tone: "outline" },
  vietnam_warehouse: { label: "Hàng về kho Việt Nam", tone: "outline" },
  shop_warehouse: { label: "Hàng về kho shop", tone: "primary" },
  pending: { label: "Chờ xử lý", tone: "outline" },
  processing: { label: "Đang xử lý", tone: "outline" },
  shipped: { label: "Đã vận chuyển", tone: "primary" },
  picked_up: { label: "Khách đã nhận tại shop", tone: "primary" },
  delivered: { label: "Đã giao", tone: "primary" },
  cancelled: { label: "Đã hủy", tone: "tertiary" },
};

export const PAYMENT_STATUS_META: Record<
  ApiOrder["paymentStatus"],
  { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }
> = {
  paid: { label: "Đã thanh toán", tone: "primary" },
  not_deposited: { label: "Chưa cọc", tone: "muted" },
  deposited: { label: "Đã cọc", tone: "outline" },
  unpaid: { label: "Chưa cọc", tone: "muted" },
  refunded: { label: "Đã hoàn tiền", tone: "tertiary" },
};

export function OrderStatusBadge({ status }: { status: ApiOrder["status"] }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: ApiOrder["paymentStatus"] }) {
  const meta = PAYMENT_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
