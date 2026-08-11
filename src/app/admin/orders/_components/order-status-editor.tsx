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
import { enableAutomaticOrderStatus, updateOrderStatus, updateOrderPaymentStatus } from "@/lib/api/orders";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

const STATUS_OPTIONS: Record<ApiOrder["orderType"], ApiOrder["status"][]> = {
  in_stock: ["packing", "shipped"],
  pre_order: ["deposit_received", "factory_ordered", "factory_shipped", "transit_warehouse", "vietnam_warehouse", "shop_warehouse", "shipped"],
};
const PAYMENT_STATUS_OPTIONS: ApiOrder["paymentStatus"][] = ["not_deposited", "deposited", "paid"];

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
    <section className="min-w-0 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{label}</span>
        {currentBadge}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>
    </section>
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
  const [trackingCode, setTrackingCode] = useState(order.trackingCode ?? "");
  const [paymentDraft, setPaymentDraft] = useState<ApiOrder["paymentStatus"]>(order.paymentStatus);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const trackingChanged = statusDraft === "shipped" && trackingCode.trim() !== (order.trackingCode ?? "").trim();

  async function handleSaveStatus() {
    setSavingStatus(true);
    try {
      const { order: updated } = await updateOrderStatus(order.id, statusDraft, statusDraft === "shipped" ? trackingCode.trim() : undefined);
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

  async function handleUseAutomaticStatus() {
    setSavingStatus(true);
    try {
      const { order: updated } = await enableAutomaticOrderStatus(order.id);
      onUpdated(updated);
      showToast("Trạng thái đơn đang tự động theo sản phẩm chậm nhất.", "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Không thể bật trạng thái tự động.", "error");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <EditorGroup label="Trạng thái đơn hàng" currentBadge={<OrderStatusBadge status={order.status} />}>
        <SelectField
          aria-label="Cập nhật trạng thái đơn hàng"
          value={statusDraft}
          onChange={(e) => setStatusDraft(e.target.value as ApiOrder["status"])}
          className="min-w-[190px] flex-1 !rounded-xl !bg-surface-container-low !px-3 !py-2.5 text-sm"
        >
          {STATUS_OPTIONS[order.orderType ?? "in_stock"].map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_META[status].label}
            </option>
          ))}
        </SelectField>
        <button
          type="button"
          disabled={(statusDraft === order.status && !trackingChanged) || savingStatus}
          onClick={handleSaveStatus}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon
            name={savingStatus ? "progress_activity" : "save"}
            className={`!text-[16px] ${savingStatus ? "animate-spin" : ""}`}
          />
          Cập nhật
        </button>
        {(order.statusMode ?? "auto") === "manual" ? (
          <button type="button" disabled={savingStatus} onClick={handleUseAutomaticStatus} className="w-full rounded-xl border border-primary/40 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 disabled:opacity-40">
            Tự động theo sản phẩm
          </button>
        ) : (
          <p className="w-full text-xs font-medium text-[#15803d]">● Đang tự động theo sản phẩm có tiến độ chậm nhất</p>
        )}
        {statusDraft === "shipped" && (
          <input
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            placeholder="Mã vận đơn"
            aria-label="Mã vận đơn"
            className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary"
          />
        )}
      </EditorGroup>

      <EditorGroup label="Thanh toán" currentBadge={<PaymentStatusBadge status={order.paymentStatus} />}>
        <SelectField
          aria-label="Cập nhật trạng thái thanh toán"
          value={paymentDraft}
          onChange={(e) => setPaymentDraft(e.target.value as ApiOrder["paymentStatus"])}
          className="min-w-[190px] flex-1 !rounded-xl !bg-surface-container-low !px-3 !py-2.5 text-sm"
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
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
