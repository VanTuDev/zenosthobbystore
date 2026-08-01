"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/store/empty-state";
import { Icon } from "@/components/ui/icon";
import { confirmPayosPayment } from "@/lib/api/payments";
import { fetchOrder } from "@/lib/api/orders";
import { formatVnd } from "@/lib/format";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder } from "@/lib/api-types";

const COUNTDOWN_SECONDS = 15 * 60;

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PayosPaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<ApiOrder | null | undefined>(undefined);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no request to make without an id
      setOrder(null);
      return;
    }
    let cancelled = false;
    fetchOrder(orderId)
      .then(({ order }) => {
        if (!cancelled) setOrder(order);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!order || order.paymentStatus === "paid") return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [order]);

  async function handleConfirm() {
    if (!orderId) return;
    setConfirming(true);
    setError(null);
    try {
      await confirmPayosPayment(orderId);
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      setConfirming(false);
      setError(err instanceof ApiRequestError ? err.message : "Xác nhận thanh toán thất bại, vui lòng thử lại.");
    }
  }

  if (order === undefined) return null;

  if (!order) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Không tìm thấy đơn hàng"
        description="Đơn hàng không tồn tại, hoặc bạn không có quyền xem đơn hàng này."
        action={<Button href="/cart">Về giỏ hàng</Button>}
      />
    );
  }

  return (
    <div className="max-w-112 mx-auto text-center">
      <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-2">
        Thanh toán qua PayOS
      </p>
      <h1 className="font-headline-md text-headline-md text-on-surface mb-6">Quét mã để hoàn tất đơn hàng</h1>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg premium-shadow">
        <div className="mx-auto w-48 h-48 rounded-xl bg-white border-2 border-dashed border-outline-variant/60 flex flex-col items-center justify-center gap-2 mb-md">
          <Icon name="qr_code_2" className="!text-[96px] text-on-surface" />
          <p className="text-[10px] text-on-surface-variant">Mã QR minh họa (demo)</p>
        </div>

        <p className="font-headline-sm text-headline-sm text-primary mb-1">{formatVnd(order.total)}</p>
        <p className="text-label-sm text-on-surface-variant mb-md">Mã đơn: {order.id}</p>

        <div className="flex items-center justify-center gap-1.5 text-label-sm text-on-surface-variant mb-lg">
          <Icon name="schedule" className="!text-[16px]" />
          {order.paymentStatus === "paid" ? "Đã thanh toán" : `Hết hạn sau ${formatCountdown(secondsLeft)}`}
        </div>

        {error && (
          <p role="alert" className="mb-md text-label-md text-error">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-sm">
          <Button type="button" onClick={handleConfirm} disabled={confirming || order.paymentStatus === "paid"}>
            {confirming ? "Đang xác nhận..." : "Tôi đã thanh toán"}
          </Button>
          <Button href="/cart" variant="secondary">
            Hủy
          </Button>
        </div>
      </div>

      <p className="text-[11px] text-on-surface-variant mt-md">
        Đây là cổng thanh toán PayOS mô phỏng cho mục đích demo — không có giao dịch thật nào được thực hiện.
      </p>
    </div>
  );
}
