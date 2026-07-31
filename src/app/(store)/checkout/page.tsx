import type { Metadata } from "next";
import { CheckoutForm } from "./_components/checkout-form";

export const metadata: Metadata = {
  title: "Thanh toán",
  description:
    "Hoàn tất đơn hàng của bạn tại ZENOS Hobby Store: nhập địa chỉ giao hàng, chọn phương thức vận chuyển và thanh toán an toàn.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <div className="pt-24 md:pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
      <h1 className="font-headline-md text-headline-md mb-sm">Thanh toán</h1>

      <CheckoutForm />
    </div>
  );
}
