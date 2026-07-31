import { Badge } from "@/components/ui/badge";
import type { ApiOrder } from "@/lib/api-types";

export const ORDER_STATUS_META: Record<
  ApiOrder["status"],
  { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }
> = {
  pending: { label: "Chờ xử lý", tone: "outline" },
  processing: { label: "Đang xử lý", tone: "outline" },
  shipped: { label: "Đang giao", tone: "primary" },
  delivered: { label: "Đã giao", tone: "primary" },
  cancelled: { label: "Đã hủy", tone: "tertiary" },
};

export const PAYMENT_STATUS_META: Record<
  ApiOrder["paymentStatus"],
  { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }
> = {
  paid: { label: "Đã thanh toán", tone: "primary" },
  unpaid: { label: "Chưa thanh toán", tone: "muted" },
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
