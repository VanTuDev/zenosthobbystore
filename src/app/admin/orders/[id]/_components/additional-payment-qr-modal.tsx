"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import { FieldLabel, textFieldClass } from "@/components/ui/form-field";
import { formatVnd } from "@/lib/format";
import { DEPOSIT_PREVIEW_STORAGE_PREFIX, type DepositPreviewDraft } from "@/lib/bank-payment";
import type { ApiOrder } from "@/lib/api-types";

export function AdditionalPaymentQrModal({ order, onClose }: { order: ApiOrder; onClose: () => void }) {
  const [newTotalInput, setNewTotalInput] = useState(String(order.total));
  const [additionalPaymentInput, setAdditionalPaymentInput] = useState("");
  const [error, setError] = useState("");

  const currentDeposit = Math.max(0, order.depositAmount ?? 0);
  const newTotal = Math.max(0, Number(newTotalInput) || 0);
  const additionalPayment = Math.max(0, Number(additionalPaymentInput) || 0);
  const paidAfterPayment = currentDeposit + additionalPayment;
  const remainingAfterPayment = Math.max(0, newTotal - paidAfterPayment);

  function createPreview(useSecondaryAccount: boolean) {
    setError("");
    if (newTotal <= 0) return setError("Giá trị đơn mới phải lớn hơn 0.");
    if (additionalPayment <= 0) return setError("Số tiền thanh toán thêm phải lớn hơn 0.");
    if (paidAfterPayment > newTotal) return setError("Tổng tiền đã cọc không được lớn hơn giá trị đơn mới.");

    const draftId = crypto.randomUUID();
    const draft: DepositPreviewDraft = {
      createdAt: Date.now(),
      paymentMode: "additional_payment",
      facebookName: order.facebookName || order.customerName,
      facebookUrl: order.facebookUrl || "",
      items: order.items.map(({ name, variantName, image, price, quantity }) => ({ name, variantName, image, price, quantity })),
      total: newTotal,
      depositAmount: additionalPayment,
      remainingAmount: remainingAfterPayment,
      currentTotal: order.total,
      currentDepositAmount: currentDeposit,
      additionalPaymentAmount: additionalPayment,
      useSecondaryAccount,
    };
    localStorage.setItem(`${DEPOSIT_PREVIEW_STORAGE_PREFIX}${draftId}`, JSON.stringify(draft));
    const previewWindow = window.open(`/xac-nhan-dat-coc/${draftId}`, "_blank");
    if (previewWindow) previewWindow.opener = null;
  }

  return (
    <Modal onClose={onClose} labelledBy="additional-payment-qr-title" icon="qr_code_2" title="Tạo QR thanh toán thêm" subtitle={`Đơn #${order.publicCode.toUpperCase()}`} maxWidthClassName="sm:max-w-[640px]">
      <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
        <section className="grid grid-cols-2 gap-3 rounded-xl bg-surface-container-low p-4 text-sm">
          <div><p className="text-on-surface-variant">Giá trị đơn hiện tại</p><p className="mt-1 font-bold">{formatVnd(order.total)}</p></div>
          <div><p className="text-on-surface-variant">Tiền cọc hiện tại</p><p className="mt-1 font-bold text-primary">{formatVnd(currentDeposit)}</p></div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="additional-payment-new-total">Giá trị đơn mới</FieldLabel>
            <input id="additional-payment-new-total" type="number" min={0} value={newTotalInput} onChange={(event) => setNewTotalInput(event.target.value)} className={textFieldClass} />
          </div>
          <div>
            <FieldLabel htmlFor="additional-payment-amount">Số tiền cọc/thanh toán thêm</FieldLabel>
            <input id="additional-payment-amount" type="number" min={0} value={additionalPaymentInput} onChange={(event) => setAdditionalPaymentInput(event.target.value)} placeholder="Nhập số tiền khách chuyển thêm" className={textFieldClass} />
          </div>
        </div>

        <section className="space-y-2 rounded-xl border border-outline-variant/30 p-4 text-sm">
          <div className="flex justify-between gap-3"><span>Tổng đã cọc sau lần này</span><strong className="text-primary">{formatVnd(paidAfterPayment)}</strong></div>
          <div className="flex justify-between gap-3 border-t border-outline-variant/20 pt-2"><span>Số tiền còn lại</span><strong>{formatVnd(remainingAfterPayment)}</strong></div>
        </section>

        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">QR chỉ dùng để yêu cầu thanh toán. Giá trị đơn và tiền cọc chưa tự cập nhật cho đến khi shop xác nhận đã nhận tiền.</p>
        {error && <p className="text-sm font-medium text-error">{error}</p>}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-outline-variant/30 px-4 py-3 sm:px-6">
        <button type="button" onClick={onClose} className="rounded-xl border border-outline-variant/60 px-4 py-2 text-sm text-on-surface-variant">Hủy</button>
        <button type="button" onClick={() => createPreview(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/60 px-4 py-2 text-sm font-bold"><Icon name="account_balance" className="!text-[18px]" /> QR phụ</button>
        <button type="button" onClick={() => createPreview(false)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"><Icon name="qr_code_2" className="!text-[18px]" /> Tạo QR</button>
      </div>
    </Modal>
  );
}
