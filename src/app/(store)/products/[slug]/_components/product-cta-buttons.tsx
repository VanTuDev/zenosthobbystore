"use client";

import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/business-info";

/**
 * No online checkout — orders are placed by contacting the shop directly
 * (phone or Facebook), then entered into the system by an admin.
 */
export function ProductCtaButtons({
  productName,
  isPreOrder,
  isSoldOut,
}: {
  productName: string;
  isPreOrder: boolean;
  isSoldOut: boolean;
}) {
  const phoneHref = `tel:${BUSINESS_INFO.phone.replace(/\s+/g, "")}`;
  const messagePrefill = `Chào ZENOS, mình muốn hỏi về sản phẩm "${productName}"`;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <a
        href={phoneHref}
        className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
      >
        <Icon name="call" />
        GỌI ĐẶT HÀNG: {BUSINESS_INFO.phone}
      </a>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        title={messagePrefill}
        className="w-full py-4 border-2 border-on-surface text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Icon name="chat" />
        NHẮN TIN QUA FACEBOOK
      </a>
      <p className="text-center text-label-sm text-on-surface-variant">
        {isSoldOut
          ? "Sản phẩm tạm hết hàng — liên hệ để được báo khi có hàng trở lại."
          : isPreOrder
            ? "Liên hệ để đặt trước và giữ suất mua sản phẩm này."
            : "Liên hệ trực tiếp để được tư vấn giá và tình trạng hàng mới nhất."}
      </p>
    </div>
  );
}
