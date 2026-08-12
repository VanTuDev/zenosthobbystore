import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { fetchPublicOrder } from "@/lib/api/orders";
import type { ApiOrder } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng",
  description: "Xem trạng thái đơn hàng tại ZENOST Hobby Store.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ApiOrder["status"], string> = {
  packing: "Đang đóng hàng",
  deposit_received: "Đã nhận đặt cọc",
  factory_ordered: "Đã đặt hàng với xưởng",
  factory_shipped: "Xưởng trả hàng",
  transit_warehouse: "Hàng về kho trung chuyển",
  vietnam_warehouse: "Hàng về kho Việt Nam",
  shop_warehouse: "Hàng về kho shop",
  shipped: "Đã vận chuyển",
  picked_up: "Khách đã nhận tại shop",
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_STEPS: Record<ApiOrder["orderType"], ApiOrder["status"][]> = {
  in_stock: ["packing", "shipped"],
  pre_order: ["deposit_received", "factory_ordered", "factory_shipped", "transit_warehouse", "vietnam_warehouse", "shop_warehouse", "shipped"],
};

const STATUS_NOTE: Partial<Record<ApiOrder["status"], string>> = {
  deposit_received: "Dự kiến đặt hàng với xưởng trong 1 ngày",
  factory_ordered: "Đang đợi xưởng trả hàng",
  factory_shipped: "Dự kiến hàng về kho trung chuyển trong 3 ngày",
  transit_warehouse: "Dự kiến về kho Việt Nam trong 3 ngày",
  vietnam_warehouse: "Dự kiến về shop trong 3 ngày",
  shop_warehouse: "Dự kiến được vận chuyển trong 1 ngày",
  shipped: "Dự kiến nhận hàng trong 2 ngày",
  picked_up: "Khách đã nhận sản phẩm trực tiếp tại cửa hàng",
};

export default async function PublicOrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const response = await fetchPublicOrder(code).catch(() => null);
  if (!response) notFound();
  const order = response.order;
  const steps = order.status === "picked_up"
    ? STATUS_STEPS[order.orderType].map((status) => (status === "shipped" ? "picked_up" : status))
    : STATUS_STEPS[order.orderType];
  const currentIndex = Math.max(0, steps.indexOf(order.status));

  return (
    <main className="mx-auto w-full max-w-[960px] px-margin-mobile pb-xl pt-28 md:px-margin-desktop">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary">
        <Icon name="arrow_back" className="!text-[18px]" /> Trang chủ
      </Link>

      <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white shadow-sm">
        <header className="bg-on-surface px-6 py-7 text-white md:px-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Theo dõi đơn hàng</p>
          <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <h1 className="font-display-lg text-4xl uppercase tracking-[0.12em]">#{order.publicCode}</h1>
            <span className="text-sm text-white/65">{order.orderType === "pre_order" ? "Hàng order" : "Hàng có sẵn"}</span>
          </div>
        </header>

        <div className="space-y-8 p-6 md:p-9">
          <div>
            <p className="text-sm text-on-surface-variant">Khách hàng</p>
            <p className="mt-1 text-lg font-bold text-on-surface">{order.facebookName}</p>
            {(order.sourceOrderCode || order.splitOrderCodes?.length > 0) && <div className="mt-3 flex flex-wrap gap-2 text-xs">{order.sourceOrderCode && <Link href={`/theo-doi-don-hang/${order.sourceOrderCode}`} className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">Tách từ đơn #{order.sourceOrderCode.toUpperCase()}</Link>}{order.splitOrderCodes?.map((splitCode) => <Link key={splitCode} href={`/theo-doi-don-hang/${splitCode}`} className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">Theo dõi phần đã tách #{splitCode.toUpperCase()}</Link>)}</div>}
          </div>

          <section>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-on-surface">Hành trình đơn hàng</h2>
            <ol className="space-y-0">
              {steps.map((status, index) => {
                const completed = index <= currentIndex;
                const current = index === currentIndex;
                return (
                  <li key={status} className="relative flex min-h-16 gap-4">
                    {index < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${index < currentIndex ? "bg-primary" : "bg-outline-variant"}`} />}
                    <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${completed ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-white"}`}>
                      {completed && <Icon name="check" className="!text-[14px]" />}
                    </span>
                    <div className="min-w-0 flex-1 pb-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                        <p className={`shrink-0 font-medium ${current ? "text-primary" : completed ? "text-on-surface" : "text-on-surface-variant"}`}>{STATUS_LABEL[status]}</p>
                        {STATUS_NOTE[status] && (
                          <p className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ${completed ? "bg-[#dcfce7] text-[#15803d]" : "bg-error/10 text-error"}`}>
                            {STATUS_NOTE[status]}
                          </p>
                        )}
                      </div>
                      {current && <p className="mt-1 text-xs text-on-surface-variant">Trạng thái hiện tại</p>}
                      {status === "shipped" && current && order.trackingCode && (
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary/5 p-4 sm:p-5">
                          <Icon name="local_shipping" className="mt-0.5 shrink-0 text-primary !text-[24px]" />
                          <div className="min-w-0">
                            <p className="text-xs text-on-surface-variant">Mã vận đơn</p>
                            <p className="font-bold text-on-surface">{order.trackingCode}</p>
                            <p>Theo dõi ngay tại:</p>
                            <a href={`https://spx.vn/track?${encodeURIComponent(order.trackingCode.trim())}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-sm font-medium text-primary underline underline-offset-2 hover:brightness-75">
                              https://spx.vn/track?{order.trackingCode.trim()}
                              <Icon name="open_in_new" className="shrink-0 !text-[15px]" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">Sản phẩm</h2>
            <ul className="divide-y divide-outline-variant/20 rounded-2xl border border-outline-variant/20">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center gap-3 p-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill sizes="56px" className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.variantName && <p className="truncate text-xs font-medium text-primary">Biến thể: {item.variantName}</p>}
                    <p className="text-xs text-on-surface-variant">Số lượng: {item.quantity}</p>
                    <p className="mt-1 w-fit rounded-full bg-surface-container-low px-2 py-1 text-[11px] font-medium text-on-surface-variant">{STATUS_LABEL[item.itemStatus ?? order.status]}</p>
                  </div>
                  <p className="text-sm font-bold">{formatVnd(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 rounded-2xl bg-surface-container-low p-5">
            <div className="flex justify-between"><span>Tổng tiền</span><strong>{formatVnd(order.total)}</strong></div>
            <div className="flex justify-between text-primary"><span>Đã đặt cọc</span><strong>{formatVnd(order.depositAmount)}</strong></div>
            <div className="flex justify-between border-t border-outline-variant/30 pt-2 text-lg"><span>Còn lại</span><strong>{formatVnd(order.remainingAmount)}</strong></div>
          </section>

        </div>
      </section>
    </main>
  );
}
