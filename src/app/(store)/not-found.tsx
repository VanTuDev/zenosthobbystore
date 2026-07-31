import type { Metadata } from "next";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: false },
};

export default function StoreNotFound() {
  return (
    <div className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon="search_off"
        size="lg"
        titleAs="h1"
        title="404 — Không tìm thấy"
        description="Trang hoặc sản phẩm bạn tìm không tồn tại, có thể đã bị gỡ hoặc đổi tên."
        action={
          <div className="flex flex-col sm:flex-row gap-sm">
            <Button href="/products">Khám phá sản phẩm</Button>
            <Button href="/" variant="secondary">
              Về trang chủ
            </Button>
          </div>
        }
      />
    </div>
  );
}
