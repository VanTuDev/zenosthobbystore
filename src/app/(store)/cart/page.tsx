import type { Metadata } from "next";
import { CartView } from "./_components/cart-view";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Xem lại các mô hình bạn đã thêm vào giỏ hàng tại ZENOS Hobby Store.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="pt-28 pb-xl max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-lg">
        Giỏ hàng
      </h1>
      <CartView />
    </div>
  );
}
