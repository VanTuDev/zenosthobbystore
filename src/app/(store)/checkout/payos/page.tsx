import type { Metadata } from "next";
import { Suspense } from "react";
import { PayosPaymentView } from "./_components/payos-payment-view";

export const metadata: Metadata = {
  title: "Thanh toán PayOS",
  description: "Quét mã QR để hoàn tất thanh toán đơn hàng tại ZENOS Hobby Store.",
  robots: { index: false, follow: true },
};

export default function CheckoutPayosPage() {
  return (
    <div className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
      <Suspense fallback={null}>
        <PayosPaymentView />
      </Suspense>
    </div>
  );
}
