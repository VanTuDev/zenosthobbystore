import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { MyOrdersSection } from "@/components/store/my-orders-section";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Giao hàng - Bảo hành",
  description: "Tra cứu trạng thái đơn hàng và xem chính sách giao hàng, đổi trả, bảo hành tại ZENOS Hobby Store.",
  alternates: { canonical: "/giao-hang-bao-hanh" },
  robots: { index: false, follow: true },
};

const POLICY_LINKS = [
  {
    href: "/chinh-sach-giao-hang",
    icon: "local_shipping",
    title: "Chính sách giao hàng",
    description: "Thời gian, phí vận chuyển và cách đóng gói bảo vệ mô hình.",
  },
  {
    href: "/chinh-sach-doi-tra",
    icon: "verified_user",
    title: "Chính sách đổi trả & bảo hành",
    description: "Điều kiện đổi trả, quy trình hoàn tiền và thời hạn bảo hành từng loại mô hình.",
  },
];

export default function ShippingWarrantyPage() {
  return (
    <div className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Giao hàng - Bảo hành" }]} />

      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-md">
        Giao hàng - Bảo hành
      </h1>
      <p className="text-on-surface-variant font-body-lg mb-xl max-w-144">
        Tra cứu trạng thái đơn hàng đã đặt và tìm hiểu chính sách giao hàng, đổi trả, bảo hành của ZENOS.
      </p>

      <section className="mb-xl">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Tra cứu đơn hàng</h2>
        <MyOrdersSection />
      </section>

      <section>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Chính sách</h2>
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md mb-md">
          <ul className="space-y-xs text-body-md text-on-surface-variant list-disc pl-lg">
            <li>
              <span className="font-bold text-on-surface">Sản phẩm có sẵn</span> — trong kho, giao ngay theo
              chính sách vận chuyển tiêu chuẩn.
            </li>
            <li>
              <span className="font-bold text-on-surface">Đặt hàng trước (pre-order)</span> — đặt cọc 70% giá
              trị đơn hàng, thời gian nhận dự kiến 7–15 ngày kể từ lúc xác nhận đơn.
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          {POLICY_LINKS.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="flex items-start gap-sm rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md hover:border-primary/40 transition-colors"
            >
              <Icon name={policy.icon} className="text-primary shrink-0" />
              <div>
                <p className="font-label-md text-label-md text-on-surface">{policy.title}</p>
                <p className="text-label-sm text-on-surface-variant mt-1">{policy.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
