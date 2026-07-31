import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Tạo mã giảm giá",
  description: "Phát hành mã giảm giá (coupon) cho Zenos Hobby Store.",
};

export default function AdminPromotionsPage() {
  return (
    <>
      <div className="mb-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">Tạo mã giảm giá</h1>
        <p className="font-body-md text-on-surface-variant">Phát hành coupon giảm giá nhanh cho khách hàng.</p>
      </div>

      <div className="max-w-xl bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 premium-shadow">
        <div className="flex items-center gap-sm mb-lg">
          <span className="p-2 bg-tertiary-container/20 text-tertiary rounded-lg">
            <Icon name="confirmation_number" />
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Tạo mã giảm giá</h2>
            <p className="text-label-sm text-on-surface-variant">Phát hành coupon nhanh</p>
          </div>
        </div>
        <form className="space-y-md">
          <div className="space-y-xs">
            <label htmlFor="coupon-code" className="block font-label-md text-on-surface-variant">
              Mã coupon
            </label>
            <div className="relative">
              <input
                id="coupon-code"
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-headline-sm uppercase tracking-widest text-primary focus:ring-2 focus:ring-primary/20"
                type="text"
                defaultValue="ZENOS_VIP_20"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                aria-label="Tạo mã ngẫu nhiên"
              >
                <Icon name="autorenew" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label htmlFor="coupon-value" className="block font-label-md text-on-surface-variant">
                Mức giảm
              </label>
              <div className="relative">
                <input
                  id="coupon-value"
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-bold"
                  type="number"
                  defaultValue={20}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">%</span>
              </div>
            </div>
            <div className="space-y-xs">
              <label htmlFor="coupon-limit" className="block font-label-md text-on-surface-variant">
                Giới hạn dùng
              </label>
              <input
                id="coupon-limit"
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-bold"
                placeholder="200"
                type="number"
              />
            </div>
          </div>
          <div className="p-md bg-tertiary-container/10 rounded-xl border border-tertiary/10 flex items-center gap-sm">
            <Icon name="info" className="text-tertiary" />
            <p className="text-label-sm text-on-surface">
              Mã này sẽ hết hạn vào <span className="font-bold">31/08/2024</span>
            </p>
          </div>
          <Button type="submit" variant="primary" className="w-full py-4 rounded-xl shadow-lg shadow-primary/30">
            Kích hoạt mã ngay
          </Button>
        </form>
      </div>
    </>
  );
}
