import { Icon } from "@/components/ui/icon";

/**
 * No online checkout and no per-product ordering CTA — this site is browse-only, purchases
 * happen off-site via Facebook/TikTok (reachable through the floating contact bubbles). The one
 * action here scrolls down to the full video showcase section instead of linking off-page.
 */
export function ProductCtaButtons({ hasVideos, isSoldOut }: { hasVideos: boolean; isSoldOut: boolean }) {
  if (!hasVideos) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <a
        href="#video-san-pham"
        className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
      >
        <Icon name="play_circle" filled />
        XEM VIDEO THỰC TẾ
      </a>
      <p className="text-center text-label-sm text-on-surface-variant">
        {isSoldOut
          ? "Sản phẩm hiện chưa có tại cửa hàng — bạn vẫn có thể xem video để tham khảo chi tiết."
          : "Xem video TikTok/YouTube để tham khảo hình ảnh thực tế và theo dõi các kênh của ZENOST."}
      </p>
    </div>
  );
}
