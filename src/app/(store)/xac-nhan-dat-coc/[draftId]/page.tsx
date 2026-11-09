"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import {
  BANK_PAYMENT,
  DEPOSIT_PREVIEW_STORAGE_PREFIX,
  SECONDARY_BANK_PAYMENT,
  getDepositQrUrl,
  getDepositTransferContent,
  type BankPaymentAccount,
  type DepositPreviewDraft,
} from "@/lib/bank-payment";

const DRAFT_LIFETIME_MS = 24 * 60 * 60 * 1000;

export default function DepositPreviewPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params);
  const [draft, setDraft] = useState<DepositPreviewDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [activeAccount, setActiveAccount] = useState<BankPaymentAccount>(BANK_PAYMENT);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storageKey = `${DEPOSIT_PREVIEW_STORAGE_PREFIX}${draftId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as DepositPreviewDraft;
        if (!parsed.createdAt || Date.now() - parsed.createdAt > DRAFT_LIFETIME_MS) {
          localStorage.removeItem(storageKey);
          return;
        }
        setDraft(parsed);
        setActiveAccount(parsed.useSecondaryAccount ? SECONDARY_BANK_PAYMENT : BANK_PAYMENT);
      } catch {
        localStorage.removeItem(storageKey);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [draftId]);

  if (!ready) {
    return <main className="mx-auto min-h-[70vh] max-w-[960px] px-4 pb-16 pt-32 text-center text-on-surface-variant">Đang chuẩn bị thông tin đặt cọc...</main>;
  }

  if (!draft) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[720px] px-4 pb-16 pt-32 text-center">
        <Icon name="error" className="text-error !text-[48px]" />
        <h1 className="mt-3 text-2xl font-bold">Không tìm thấy thông tin đặt cọc</h1>
        <p className="mt-2 text-on-surface-variant">Bản xem trước có thể đã hết hạn hoặc được mở trên một thiết bị khác. Hãy quay lại form tạo đơn và bấm “Tạo QR cọc” lần nữa.</p>
      </main>
    );
  }

  const transferContent = getDepositTransferContent(draft.facebookName);
  const qrUrl = getDepositQrUrl(draft.depositAmount, draft.facebookName, activeAccount);
  const isAdditionalPayment = draft.paymentMode === "additional_payment";
  const currentDepositAmount = draft.currentDepositAmount ?? 0;
  const paidAfterPayment = currentDepositAmount + (draft.additionalPaymentAmount ?? draft.depositAmount);
  const usingAlternateAccount = activeAccount.accountNumber !== BANK_PAYMENT.accountNumber
    || activeAccount.bankId !== BANK_PAYMENT.bankId;

  async function handleDownloadQr() {
    const facebookName = draft!.facebookName;
    setDownloadingQr(true);
    try {
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error("Không tải được ảnh QR.");
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `QR-coc-${facebookName.replace(/[^a-zA-Z0-9À-ỹ]+/g, "-")}${usingAlternateAccount ? "-tai-khoan-phu" : ""}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingQr(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1320px] px-4 pb-10 pt-24 md:px-6">
      <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white shadow-sm">
        <header className="flex flex-col justify-between gap-2 bg-on-surface px-5 py-4 text-white sm:flex-row sm:items-center md:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">{isAdditionalPayment ? "Xác nhận thanh toán thêm" : "Xác nhận thông tin đặt cọc"}</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">{isAdditionalPayment ? "Thanh toán thêm của" : "Đơn hàng của"} {draft.facebookName}</h1>
          </div>
          <p className="text-xs text-white/65">Thông tin tạm tính trước khi shop tạo đơn hàng</p>
        </header>

        <div className="grid items-start gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px] md:p-5">
          <div className="space-y-4">
            <section className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-4 py-3">
              <div>
                <p className="text-xs text-on-surface-variant">Tên Facebook</p>
                <p className="text-lg font-bold">{draft.facebookName}</p>
              </div>
              <a href={draft.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:brightness-90">
                Mở Facebook <Icon name="open_in_new" className="!text-[15px]" />
              </a>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Sản phẩm</h2>
              <ul className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {draft.items.map((item, index) => (
                  <li key={`${item.name}-${item.variantName}-${index}`} className="flex min-w-0 items-center gap-2 rounded-xl border border-outline-variant/25 p-2">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate font-bold">{item.name}</p>
                      {item.variantName && <p className="truncate text-primary">Biến thể: {item.variantName}</p>}
                      <p className="text-on-surface-variant">{formatVnd(item.price)} × {item.quantity}</p>
                    </div>
                    <strong className="shrink-0 text-sm">{formatVnd(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </section>

            {isAdditionalPayment ? (
              <section className="space-y-2 rounded-xl bg-surface-container-low p-4 text-base">
                <div className="flex justify-between gap-4"><span>Giá trị đơn hiện tại</span><strong>{formatVnd(draft.currentTotal ?? draft.total)}</strong></div>
                <div className="flex justify-between gap-4"><span>Tiền cọc hiện tại</span><strong>{formatVnd(currentDepositAmount)}</strong></div>
                <div className="flex justify-between gap-4"><span>Giá trị đơn mới</span><strong>{formatVnd(draft.total)}</strong></div>
                <div className="flex justify-between gap-4 text-primary"><span>Số tiền thanh toán thêm</span><strong>{formatVnd(draft.additionalPaymentAmount ?? draft.depositAmount)}</strong></div>
                <div className="flex justify-between gap-4"><span>Tổng đã cọc sau lần này</span><strong>{formatVnd(paidAfterPayment)}</strong></div>
                <div className="flex justify-between gap-4 border-t border-outline-variant/30 pt-2 text-lg"><span>Số tiền còn lại</span><strong>{formatVnd(draft.remainingAmount)}</strong></div>
              </section>
            ) : (
              <section className="space-y-2 rounded-xl bg-surface-container-low p-4 text-base">
                <div className="flex justify-between gap-4"><span>Tổng tiền hàng</span><strong>{formatVnd(draft.total)}</strong></div>
                <div className="flex justify-between gap-4 text-primary"><span>Tiền cần đặt cọc</span><strong>{formatVnd(draft.depositAmount)}</strong></div>
                <div className="flex justify-between gap-4 border-t border-outline-variant/30 pt-2 text-lg"><span>Số tiền còn lại</span><strong>{formatVnd(draft.remainingAmount)}</strong></div>
              </section>
            )}

            <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm leading-5 text-on-surface-variant">
              {isAdditionalPayment ? (
                "Kiểm tra kỹ giá trị đơn mới và số tiền thanh toán thêm. Sau khi chuyển khoản, vui lòng gửi ảnh giao dịch cho shop; số tiền cọc chỉ được cập nhật khi shop xác nhận đã nhận tiền."
              ) : (
                <div className="space-y-1.5">
                  <p className="font-bold text-on-surface">Kiểm tra thông tin chi tiết về đơn hàng trước khi chuyển khoản.</p>
                  <p><strong>Chính sách bảo hành và đóng gói:</strong> Toàn bộ sản phẩm về shop sẽ được kiểm tra trước về khớp và phụ kiện.</p>
                  <p>Quy trình đóng gói luôn được bọc xốp và đóng hộp carton bên ngoài.</p>
                  <p>Bảo hành toàn bộ các vấn đề liên quan về: gãy, vỡ, thiếu phụ kiện hoặc thiếu bộ phận.</p>
                  <p>Không bảo hành các trường hợp sơn lem, trầy xước và box đối với các sản phẩm giá rẻ.</p>
                  <p>Khách hàng nhận hàng vui lòng quay video chi tiết để được hỗ trợ xử lý nhanh chóng và khiếu nại với ĐVVC khi cần thiết.</p>
                </div>
              )}
            </div>
          </div>

          <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <div className="text-left">
                <h2 className="text-sm font-bold uppercase tracking-wider">{isAdditionalPayment ? "Quét mã để thanh toán thêm" : "Quét mã để đặt cọc"}</h2>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                <button type="button" onClick={() => setActiveAccount(usingAlternateAccount ? BANK_PAYMENT : SECONDARY_BANK_PAYMENT)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/25 bg-white px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">
                  <Icon name="account_balance" className="!text-[16px]" /> {usingAlternateAccount ? "Dùng QR mặc định" : "Tạo QR phụ"}
                </button>
                <button type="button" onClick={() => void handleDownloadQr()} disabled={downloadingQr} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/25 bg-white px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 disabled:opacity-60">
                  <Icon name="download" className="!text-[16px]" /> {downloadingQr ? "Đang tải" : "Tải QR"}
                </button>
              </div>
            </div>
            {/* VietQR Quick Link returns the draft-specific transfer QR as an image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`Mã QR đặt cọc của ${draft.facebookName}`} width={280} height={280} className="mx-auto mt-2 h-auto w-full max-w-[280px] rounded-xl bg-white" />
            <div className="mt-2 space-y-0.5 text-sm">
              <p><strong>{activeAccount.bankName}</strong> · {activeAccount.accountNumber}</p>
              <p>{activeAccount.accountName}</p>
              <p>{isAdditionalPayment ? "Thanh toán thêm" : "Số tiền"}: <strong className="text-primary">{formatVnd(draft.depositAmount)}</strong></p>
              <p>Nội dung: <strong>{transferContent}</strong></p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
