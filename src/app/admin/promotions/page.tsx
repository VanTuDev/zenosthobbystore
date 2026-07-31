import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Icon } from "@/components/ui/icon";
import { CouponForm } from "./_components/coupon-form";

export const metadata: Metadata = {
  title: "Tạo mã giảm giá",
  description: "Phát hành mã giảm giá (coupon) cho Zenos Hobby Store.",
};

export default function AdminPromotionsPage() {
  return (
    <>
      <AdminPageHeader
        title="Tạo mã giảm giá"
        description="Phát hành coupon giảm giá nhanh cho khách hàng."
      />

      <div className="max-w-xl bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 premium-shadow transition-shadow duration-300 hover:shadow-xl">
        <div className="flex items-center gap-sm mb-lg">
          <span className="flex items-center justify-center w-11 h-11 shrink-0 bg-tertiary-container/20 text-tertiary rounded-xl">
            <Icon name="confirmation_number" />
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Coupon mới</h2>
            <p className="text-label-sm text-on-surface-variant">Điền thông tin bên dưới để phát hành ngay</p>
          </div>
        </div>

        <CouponForm />
      </div>
    </>
  );
}
