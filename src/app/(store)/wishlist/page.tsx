import type { Metadata } from "next";
import { WishlistGrid } from "./_components/wishlist-grid";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích",
  description: "Danh sách các mô hình anime bạn đã lưu để mua sau tại ZENOS Hobby Store.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="pt-28 pb-xl max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-lg">
        Sản phẩm yêu thích
      </h1>
      <WishlistGrid />
    </div>
  );
}
