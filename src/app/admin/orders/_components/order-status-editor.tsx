"use client";

import { useState } from "react";
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/order-status-badge";
import { useToast } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";
import { SelectField } from "@/components/ui/select-field";
import { updateOrderStatus, updateOrderPaymentStatus } from "@/lib/api/orders";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

const STATUS_OPTIONS: ApiOrder["status"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUS_OPTIONS: ApiOrder["paymentStatus"][] = ["unpaid", "paid", "refunded"];

function EditorGroup({
  label,
  currentBadge,
  children,
}: {
  label: string;
  currentBadge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-64 flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">{label}</span>
        {currentBadge}
      </div>
      <div className="flex items-center gap-xs">{children}</div>
    </div>
  );
}

export function OrderStatusEditor({
  order,
  onUpdated,
}: {
  order: ApiOrder;
  onUpdated: (order: ApiOrder) => void;
}) {
  const { showToast } = useToast();
  const [statusDraft, setStatusDraft] = useState<ApiOrder["status"]>(order.status);
  const [paymentDraft, setPaymentDraft] = useState<ApiOrder["paymentStatus"]>(order.paymentStatus);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  async function handleSaveStatus() {
    setSavingStatus(true);
    try {
      const { order: updated } = await updateOrderStatus(order.id, statusDraft);
      onUpdated(updated);
      showToast("Đã cập nhật trạng thái đơn hàng.", "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Cập nhật thất bại.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSavePayment() {
    setSavingPayment(true);
    try {
      const { order: updated } = await updateOrderPaymentStatus(order.id, paymentDraft);
      onUpdated(updated);
      showToast("Đã cập nhật trạng thái thanh toán.", "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Cập nhật thất bại.", "error");
    } finally {
      setSavingPayment(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-md flex flex-col sm:flex-row gap-md">
      <EditorGroup label="Trạng thái đơn hàng" currentBadge={<OrderStatusBadge status={order.status} />}>
        <SelectField
          aria-label="Cập nhật trạng thái đơn hàng"
          value={statusDraft}
          onChange={(e) => setStatusDraft(e.target.value as ApiOrder["status"])}
          className="!p-2 text-[13px]"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_META[status].label}
            </option>
          ))}
        </SelectField>
        <button
          type="button"
          disabled={statusDraft === order.status || savingStatus}
          onClick={handleSaveStatus}
          className="shrink-0 flex items-center gap-1 px-sm py-2 bg-primary text-on-primary rounded-lg text-[13px] font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon
            name={savingStatus ? "progress_activity" : "save"}
            className={`!text-[16px] ${savingStatus ? "animate-spin" : ""}`}
          />
          Cập nhật
        </button>
      </EditorGroup>

      <div className="hidden sm:block w-px bg-outline-variant/30" />

      <EditorGroup label="Thanh toán" currentBadge={<PaymentStatusBadge status={order.paymentStatus} />}>
        <SelectField
          aria-label="Cập nhật trạng thái thanh toán"
          value={paymentDraft}
          onChange={(e) => setPaymentDraft(e.target.value as ApiOrder["paymentStatus"])}
          className="!p-2 text-[13px]"
        >
          {PAYMENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {PAYMENT_STATUS_META[status].label}
            </option>
          ))}
        </SelectField>
        <button
          type="button"
          disabled={paymentDraft === order.paymentStatus || savingPayment}
          onClick={handleSavePayment}
          className="shrink-0 flex items-center gap-1 px-sm py-2 border-2 border-primary text-primary rounded-lg text-[13px] font-bold hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon
            name={savingPayment ? "progress_activity" : "payments"}
            className={`!text-[16px] ${savingPayment ? "animate-spin" : ""}`}
          />
          Cập nhật
        </button>
      </EditorGroup>
    </div>
  );
}
