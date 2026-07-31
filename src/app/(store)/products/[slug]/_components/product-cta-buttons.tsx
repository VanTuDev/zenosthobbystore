"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Icon } from "@/components/ui/icon";

export function ProductCtaButtons({
  productId,
  isPreOrder,
  isSoldOut,
}: {
  productId: string;
  isPreOrder: boolean;
  isSoldOut: boolean;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    addItem(productId);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(productId);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4 mb-8">
      <button
        type="button"
        disabled={isSoldOut}
        onClick={handleBuyNow}
        className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name="bolt" />
        {isPreOrder ? "ĐẶT HÀNG TRƯỚC NGAY" : isSoldOut ? "TẠM HẾT HÀNG" : "MUA NGAY"}
      </button>
      <button
        type="button"
        disabled={isSoldOut}
        onClick={handleAddToCart}
        className={`w-full py-4 border-2 font-label-md text-label-md rounded-xl active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          justAdded
            ? "border-primary text-primary bg-primary/5"
            : "border-on-surface text-on-surface hover:bg-surface-container-low"
        }`}
      >
        <Icon name={justAdded ? "check" : "add_shopping_cart"} className={justAdded ? "animate-pop" : ""} />
        {justAdded ? "ĐÃ THÊM VÀO GIỎ HÀNG" : "THÊM VÀO GIỎ HÀNG"}
      </button>
    </div>
  );
}
