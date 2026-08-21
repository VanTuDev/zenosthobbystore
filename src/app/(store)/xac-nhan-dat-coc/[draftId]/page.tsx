"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import {
  BANK_PAYMENT,
  DEPOSIT_PREVIEW_STORAGE_PREFIX,
  getDepositQrUrl,
  getDepositTransferContent,
  type DepositPreviewDraft,
} from "@/lib/bank-payment";

const DRAFT_LIFETIME_MS = 24 * 60 * 60 * 1000;

export default function DepositPreviewPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = use(params);
  const [draft, setDraft] = useState<DepositPreviewDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

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
  const qrUrl = getDepositQrUrl(draft.depositAmount, draft.facebookName);

  async function handleDownloadQr() {
    const facebookName = draft!.facebookName;
    setDownloadingQr(true);
    try {
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error("Không tải được ảnh QR.");
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `QR-coc-${facebookName.replace(/[^a-zA-Z0-9À-ỹ]+/g, "-")}.png`;
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Xác nhận thông tin đặt cọc</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Đơn hàng của {draft.facebookName}</h1>
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

            <section className="space-y-2 rounded-xl bg-surface-container-low p-4 text-base">
              <div className="flex justify-between gap-4"><span>Tổng tiền hàng</span><strong>{formatVnd(draft.total)}</strong></div>
              <div className="flex justify-between gap-4 text-primary"><span>Tiền cần đặt cọc</span><strong>{formatVnd(draft.depositAmount)}</strong></div>
              <div className="flex justify-between gap-4 border-t border-outline-variant/30 pt-2 text-lg"><span>Số tiền còn lại</span><strong>{formatVnd(draft.remainingAmount)}</strong></div>
            </section>

            <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm leading-5 text-on-surface-variant">
              Kiểm tra kỹ tên Facebook, sản phẩm, biến thể, số lượng và số tiền. Sau khi chuyển khoản, vui lòng gửi ảnh giao dịch cho shop; đơn chỉ được tạo khi shop xác nhận đã nhận cọc.
            </div>
          </div>

          <section className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider">Quét mã để đặt cọc</h2>
              <button type="button" onClick={() => void handleDownloadQr()} disabled={downloadingQr} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/25 bg-white px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 disabled:opacity-60">
                <Icon name="download" className="!text-[16px]" /> {downloadingQr ? "Đang tải" : "Tải ảnh QR"}
              </button>
            </div>
            {/* VietQR Quick Link returns the draft-specific transfer QR as an image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`Mã QR đặt cọc của ${draft.facebookName}`} width={280} height={280} className="mx-auto mt-2 h-auto w-full max-w-[280px] rounded-xl bg-white" />
            <div className="mt-2 space-y-0.5 text-sm">
              <p><strong>{BANK_PAYMENT.bankName}</strong> · {BANK_PAYMENT.accountNumber}</p>
              <p>{BANK_PAYMENT.accountName}</p>
              <p>Số tiền: <strong className="text-primary">{formatVnd(draft.depositAmount)}</strong></p>
              <p>Nội dung: <strong>{transferContent}</strong></p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
