"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useCartLines } from "@/components/providers/cart-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { CartLineItem } from "@/components/store/cart-line-item";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import { fetchPromotionByCode } from "@/lib/api/promotions";
import { createOrder } from "@/lib/api/orders";
import { createPayosPayment } from "@/lib/api/payments";
import { fetchProvinces, fetchWards } from "@/lib/api/locations";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder, ApiPromotion, ApiProvince, ApiWard } from "@/lib/api-types";

type ShippingMethodId = "standard" | "express";
type PaymentMethodId = "bank_transfer" | "cod" | "payos";

const SHIPPING_METHODS: {
  id: ShippingMethodId;
  label: string;
  detail: string;
  fee: number;
}[] = [
  {
    id: "standard",
    label: "Giao hàng tiêu chuẩn",
    detail: "3 - 5 ngày làm việc",
    fee: 0,
  },
  {
    id: "express",
    label: "Giao hàng nhanh (Hỏa tốc)",
    detail: "1 - 2 ngày làm việc",
    fee: 45000,
  },
];

const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  detail: string;
  icon: string;
}[] = [
  {
    id: "bank_transfer",
    label: "Chuyển khoản ngân hàng",
    detail: "Chuyển khoản qua QR code hoặc số tài khoản",
    icon: "account_balance",
  },
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    detail: "Kiểm tra hàng trước khi thanh toán",
    icon: "local_shipping",
  },
  {
    id: "payos",
    label: "Thanh toán qua PayOS (QR)",
    detail: "Quét mã QR để thanh toán tức thì",
    icon: "qr_code_2",
  },
];

const TAX_RATE = 0.08;

const PAYMENT_METHOD_LABEL: Record<PaymentMethodId, ApiOrder["paymentMethod"]> = {
  bank_transfer: "Chuyển khoản",
  cod: "COD",
  payos: "Ví điện tử",
};

export function CheckoutForm() {
  const router = useRouter();
  const { setQuantity, removeItem, clear } = useCart();
  const { user, openLoginModal } = useAuth();
  const { lines: items, isLoading: isCartLoading } = useCartLines();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("bank_transfer");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ApiPromotion | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const [selectedProvince, setSelectedProvince] = useState<ApiProvince | null>(null);
  const [selectedWard, setSelectedWard] = useState<ApiWard | null>(null);

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoMessage("Vui lòng nhập mã giảm giá.");
      setAppliedPromo(null);
      return;
    }

    try {
      const { promotion, isValid } = await fetchPromotionByCode(code);
      if (!isValid) {
        setAppliedPromo(null);
        setPromoMessage(
          promotion.status === "expired"
            ? "Mã giảm giá này đã hết hạn."
            : promotion.status === "scheduled"
              ? "Mã giảm giá này chưa bắt đầu áp dụng."
              : "Mã giảm giá đã hết lượt sử dụng.",
        );
        return;
      }
      if (promotion.type === "bundle") {
        setAppliedPromo(null);
        setPromoMessage(`"${promotion.code}" là khuyến mãi tặng kèm, vui lòng liên hệ CSKH để áp dụng.`);
        return;
      }
      setAppliedPromo(promotion);
      setPromoMessage(
        promotion.type === "percentage"
          ? `Áp dụng thành công! Giảm ${promotion.value}% tổng đơn hàng.`
          : `Áp dụng thành công! Giảm ${formatVnd(promotion.value)}.`,
      );
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        setAppliedPromo(null);
        setPromoMessage("Mã giảm giá không tồn tại.");
        return;
      }
      throw err;
    }
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );
  const shippingFee = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.fee ?? 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const discount = !appliedPromo
    ? 0
    : appliedPromo.type === "percentage"
      ? Math.round(subtotal * (appliedPromo.value / 100))
      : Math.min(subtotal, appliedPromo.value);
  const total = subtotal + shippingFee + tax - discount;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setPlaceError("Vui lòng đăng nhập để hoàn tất đặt hàng.");
      openLoginModal();
      return;
    }

    setPlacing(true);
    setPlaceError(null);

    const province = selectedProvince;
    const ward = selectedWard;
    if (!province || !ward) {
      setPlacing(false);
      setPlaceError("Vui lòng chọn Tỉnh/Thành phố và Phường/Xã.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const addressDetail = String(data.get("streetAddress") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    try {
      const { order } = await createOrder({
        customerName: `${lastName} ${firstName}`.trim() || user.name,
        customerEmail: email || user.email,
        phone,
        provinceCode: province.code,
        provinceName: province.fullName,
        wardCode: ward.code,
        wardName: ward.fullName,
        addressDetail,
        items: items.map((item) => ({
          productId: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          image: item.product.heroImage,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingFee,
        tax,
        promotionCode: appliedPromo?.code,
        paymentMethod: PAYMENT_METHOD_LABEL[paymentMethod],
        paymentStatus: "unpaid",
      });

      clear();
      if (paymentMethod === "payos") {
        await createPayosPayment(order.id);
        router.push(`/checkout/payos?orderId=${order.id}`);
        return;
      }
      router.push(`/order-confirmation?orderId=${order.id}`);
    } catch (err) {
      setPlacing(false);
      setPlaceError(
        err instanceof ApiRequestError ? err.message : "Đặt hàng thất bại, vui lòng thử lại.",
      );
    }
  }

  if (isCartLoading) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart"
        title="Giỏ hàng trống"
        description="Thêm mô hình vào giỏ hàng trước khi tiến hành thanh toán."
        action={<Button href="/products">Khám phá sản phẩm</Button>}
        className="mt-lg"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-lg mt-md">
      {/* Cột trái: Thông tin thanh toán */}
      <div className="lg:col-span-7">
        {/* Thanh tiến trình */}
        <div className="flex items-center mb-md gap-md overflow-x-auto pb-xs" aria-hidden="true">
          <div className="flex items-center gap-xs whitespace-nowrap">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold">
              1
            </span>
            <span className="font-label-md text-label-md text-primary">Vận chuyển</span>
          </div>
          <div className="h-[2px] w-8 bg-surface-container-highest" />
          <div className="flex items-center gap-xs whitespace-nowrap">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold">
              2
            </span>
            <span className="font-label-md text-label-md text-primary">Thanh toán</span>
          </div>
          <div className="h-[2px] w-8 bg-surface-container-highest" />
          <div className="flex items-center gap-xs whitespace-nowrap opacity-50">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              3
            </span>
            <span className="font-label-md text-label-md">Xem lại</span>
          </div>
        </div>

        {/* Địa chỉ nhận hàng */}
        <section className="space-y-sm">
          <h2 className="font-headline-sm text-headline-sm">Địa chỉ nhận hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            <div className="flex flex-col gap-xs">
              <label htmlFor="first-name" className="font-label-md text-label-md text-on-surface-variant">
                Tên
              </label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                required
                placeholder="vd: Kenji"
                className="bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="last-name" className="font-label-md text-label-md text-on-surface-variant">
                Họ
              </label>
              <input
                id="last-name"
                name="lastName"
                type="text"
                required
                placeholder="vd: Sato"
                className="bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-xs">
              <label htmlFor="street-address" className="font-label-md text-label-md text-on-surface-variant">
                Địa chỉ nhà
              </label>
              <input
                id="street-address"
                name="streetAddress"
                type="text"
                required
                placeholder="123 Đại lộ Nguyễn Huệ, Quận 1"
                className="bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="province" className="font-label-md text-label-md text-on-surface-variant">
                Tỉnh / Thành phố
              </label>
              <SearchCombobox<ApiProvince>
                id="province"
                required
                placeholder="Tìm Tỉnh/Thành phố..."
                selected={selectedProvince}
                getKey={(p) => p.code}
                getLabel={(p) => p.fullName}
                onSearch={fetchProvinces}
                onSelect={(province) => {
                  setSelectedProvince(province);
                  setSelectedWard(null);
                }}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="ward" className="font-label-md text-label-md text-on-surface-variant">
                Phường / Xã
              </label>
              <SearchCombobox<ApiWard>
                id="ward"
                required
                placeholder="Tìm Phường/Xã..."
                disabled={!selectedProvince}
                disabledPlaceholder="Chọn Tỉnh/Thành phố trước"
                selected={selectedWard}
                getKey={(w) => w.code}
                getLabel={(w) => w.fullName}
                onSearch={(query) => fetchWards(selectedProvince!.code, query)}
                onSelect={setSelectedWard}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="phone" className="font-label-md text-label-md text-on-surface-variant">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="09xx xxx xxx"
                className="bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="collector@zenos.com"
                className="bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Phương thức vận chuyển */}
        <section className="pt-sm mt-md border-t border-surface-container-highest">
          <h2 className="font-headline-sm text-headline-sm mb-sm">Phương thức vận chuyển</h2>
          <div className="space-y-xs">
            {SHIPPING_METHODS.map((method) => {
              const isChecked = shippingMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-sm bg-surface-container-low rounded-lg cursor-pointer border-2 transition-all ${
                    isChecked ? "border-primary/40" : "border-transparent hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-md">
                    <input
                      type="radio"
                      name="shipping-method"
                      value={method.id}
                      checked={isChecked}
                      onChange={() => setShippingMethod(method.id)}
                      className="w-5 h-5 text-primary border-outline focus:ring-primary"
                    />
                    <div>
                      <div className="font-label-md text-label-md">{method.label}</div>
                      <div className="text-sm text-on-surface-variant">{method.detail}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${method.fee === 0 ? "text-primary" : "text-on-surface"}`}>
                    {method.fee === 0 ? "Miễn phí" : formatVnd(method.fee)}
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Phương thức thanh toán */}
        <section className="pt-sm mt-md border-t border-surface-container-highest">
          <h2 className="font-headline-sm text-headline-sm mb-sm">Phương thức thanh toán</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
            {PAYMENT_METHODS.map((method) => {
              const isChecked = paymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={`flex items-start gap-sm p-sm bg-surface-container-low rounded-lg cursor-pointer border-2 transition-all ${
                    isChecked ? "border-primary/40" : "border-transparent hover:border-primary/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={isChecked}
                    onChange={() => setPaymentMethod(method.id)}
                    className="w-5 h-5 mt-1 text-primary border-outline focus:ring-primary"
                  />
                  <div className="flex items-start gap-sm">
                    <Icon name={method.icon} className="text-primary mt-0.5" />
                    <div>
                      <div className="font-label-md text-label-md">{method.label}</div>
                      <div className="text-sm text-on-surface-variant">{method.detail}</div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Ghi chú đơn hàng */}
        <section className="pt-sm mt-md border-t border-surface-container-highest">
          <label htmlFor="order-note" className="font-label-md text-label-md text-on-surface-variant block mb-xs">
            Ghi chú đơn hàng (không bắt buộc)
          </label>
          <textarea
            id="order-note"
            name="orderNote"
            rows={2}
            placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
            className="w-full bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          />
        </section>

        {placeError && (
          <p role="alert" className="mt-md text-label-md text-error">
            {placeError}
          </p>
        )}

        <div className="pt-md flex items-center justify-between flex-wrap gap-md">
          <Link href="/products" className="text-primary font-bold flex items-center gap-xs hover:underline">
            <Icon name="arrow_back" />
            Tiếp tục mua sắm
          </Link>
          <button
            type="submit"
            disabled={placing || items.length === 0}
            className="bg-primary text-on-primary px-xl py-md rounded-lg font-bold hover:brightness-110 transition-all active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {placing ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </div>
      </div>

      {/* Cột phải: Tóm tắt đơn hàng */}
      <aside className="lg:col-span-5" aria-label="Tóm tắt đơn hàng">
        <div className="sticky top-28 bg-surface-container-low p-lg rounded-xl border border-surface-container-highest shadow-sm">
          <h2 className="font-headline-sm text-headline-sm mb-lg">Tóm tắt đơn hàng</h2>

          {/* Danh sách sản phẩm */}
          <ul className="space-y-base mb-lg">
            {items.map((item) => (
              <CartLineItem
                key={item.product.id}
                product={item.product}
                quantity={item.quantity}
                size="sm"
                onIncrement={() => setQuantity(item.product.id, item.quantity + 1)}
                onDecrement={() => setQuantity(item.product.id, item.quantity - 1)}
                onRemove={() => removeItem(item.product.id)}
              />
            ))}
          </ul>

          {/* Mã giảm giá */}
          <div className="mb-lg">
            <div className="flex gap-base">
              <label htmlFor="promo-code" className="sr-only">
                Mã giảm giá
              </label>
              <input
                id="promo-code"
                type="text"
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value)}
                placeholder="Mã giảm giá"
                className="flex-grow bg-white border-none rounded-lg p-md text-sm outline-none shadow-sm"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="border-2 border-primary text-primary px-md py-base rounded-lg font-bold hover:bg-primary/5 transition-all"
              >
                Áp dụng
              </button>
            </div>
            {promoMessage && (
              <p
                role="status"
                className={`text-label-sm mt-xs ${appliedPromo ? "text-primary" : "text-error"}`}
              >
                {promoMessage}
              </p>
            )}
          </div>

          {/* Chi tiết giá */}
          <div className="space-y-sm pt-md text-body-md border-t border-surface-container-highest">
            <div className="flex justify-between text-on-surface-variant">
              <span>Tạm tính</span>
              <span>{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí vận chuyển</span>
              <span className={shippingFee === 0 ? "text-primary font-medium" : ""}>
                {shippingFee === 0 ? "MIỄN PHÍ" : formatVnd(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Thuế VAT (Ước tính {Math.round(TAX_RATE * 100)}%)</span>
              <span>{formatVnd(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Giảm giá ({appliedPromo?.code})</span>
                <span>-{formatVnd(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-lg mt-md border-t border-surface-container-highest">
              <span className="font-headline-sm text-headline-md">Tổng cộng</span>
              <span className="font-headline-sm text-headline-md text-primary">{formatVnd(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
