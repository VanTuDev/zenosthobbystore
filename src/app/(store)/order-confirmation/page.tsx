import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationView } from "./_components/order-confirmation-view";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  description: "Xác nhận đơn hàng của bạn tại ZENOS Hobby Store.",
  robots: { index: false, follow: true },
};

export default function OrderConfirmationPage() {
  return (
    <div className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
      <Suspense fallback={null}>
        <OrderConfirmationView />
      </Suspense>
    </div>
  );
}
