"use client";

import { useState } from "react";
import { updateOrderDetails } from "@/lib/api/orders";
import { ApiRequestError } from "@/lib/api-client";
import { formatVnd } from "@/lib/format";
import { SelectField } from "@/components/ui/select-field";
import { Icon } from "@/components/ui/icon";
import type { ApiOrder } from "@/lib/api-types";

export function OrderDetailsEditor({ order, onUpdated }: { order: ApiOrder; onUpdated: (order: ApiOrder) => void }) {
  const [orderType, setOrderType] = useState(order.orderType);
  const [facebookName, setFacebookName] = useState(order.facebookName || order.customerName);
  const [facebookUrl, setFacebookUrl] = useState(order.facebookUrl || "");
  const [phone, setPhone] = useState(order.phone || "");
  const [addressDetail, setAddressDetail] = useState(order.addressDetail || "");
  const [total, setTotal] = useState(String(order.total));
  const [depositAmount, setDepositAmount] = useState(String(order.depositAmount ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalNumber = Math.max(0, Number(total) || 0);
  const depositNumber = Math.max(0, Number(depositAmount) || 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await updateOrderDetails(order.id, {
        orderType,
        facebookName: facebookName.trim(),
        facebookUrl: facebookUrl.trim(),
        phone: phone.trim(),
        addressDetail: addressDetail.trim(),
        total: totalNumber,
        depositAmount: depositNumber,
      });
      onUpdated(response.order);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Không thể cập nhật đơn hàng.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-headline-sm text-headline-sm">Thông tin đơn</h2>
        <p className="mt-1 text-xs text-on-surface-variant">Có thể bổ sung hoặc thay đổi sau khi tạo đơn</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField aria-label="Loại đơn hàng" value={orderType} onChange={(event) => setOrderType(event.target.value as ApiOrder["orderType"])} className="!px-3 !py-2 text-sm">
          <option value="in_stock">Hàng có sẵn</option>
          <option value="pre_order">Hàng order</option>
        </SelectField>
        <input required value={facebookName} onChange={(event) => setFacebookName(event.target.value)} aria-label="Tên Facebook" placeholder="Tên Facebook" className="rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
        <div className="flex min-w-0 gap-2">
          <input required type="url" value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} aria-label="Link Facebook" placeholder="Link Facebook" className="min-w-0 flex-1 rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
          <a href={facebookUrl.startsWith("http") ? facebookUrl : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!facebookUrl.startsWith("http")} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 text-primary transition ${facebookUrl.startsWith("http") ? "hover:bg-primary/10" : "pointer-events-none opacity-35"}`} title="Mở Facebook khách hàng trong tab mới" aria-label="Mở Facebook khách hàng trong tab mới"><Icon name="open_in_new" className="!text-[18px]" /></a>
        </div>
        <input value={phone} onChange={(event) => setPhone(event.target.value)} aria-label="Số điện thoại" placeholder="Số điện thoại" className="rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
        <input value={addressDetail} onChange={(event) => setAddressDetail(event.target.value)} aria-label="Địa chỉ" placeholder="Địa chỉ" className="rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
        <input type="number" min={0} value={total} onChange={(event) => setTotal(event.target.value)} aria-label="Tổng tiền" placeholder="Tổng tiền" className="rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
        <input type="number" min={0} max={totalNumber} value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} aria-label="Tiền đặt cọc" placeholder="Tiền đặt cọc" className="rounded-lg bg-surface-container-low px-3 py-2 text-sm" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">Còn lại: <strong className="text-primary">{formatVnd(Math.max(0, totalNumber - depositNumber))}</strong></p>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </form>
  );
}
