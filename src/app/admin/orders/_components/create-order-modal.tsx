"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { textFieldClass, FieldLabel } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { formatVnd } from "@/lib/format";
import { createOrder } from "@/lib/api/orders";
import { fetchProducts } from "@/lib/api/products";
import { fetchProvinces, fetchWards } from "@/lib/api/locations";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder, ApiProduct, ApiProvince, ApiWard } from "@/lib/api-types";

type DraftItem = {
  key: string;
  productId?: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

const PAYMENT_METHODS: ApiOrder["paymentMethod"][] = ["Chuyển khoản", "COD", "Thẻ tín dụng", "Ví điện tử"];
const PAYMENT_STATUSES: ApiOrder["paymentStatus"][] = ["unpaid", "paid", "refunded"];
const PAYMENT_STATUS_LABEL: Record<ApiOrder["paymentStatus"], string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

/**
 * Manual order entry for orders taken by phone/Facebook/in person — replaces the Excel sheet the
 * admin used before there was no client-side checkout. Reuses the same `POST /orders` endpoint
 * the (now-removed) storefront checkout used; the signed-in admin becomes the order's `userId`.
 */
export function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: (order: ApiOrder) => void }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<ApiProvince | null>(null);
  const [selectedWard, setSelectedWard] = useState<ApiWard | null>(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [shippingFee, setShippingFee] = useState("0");
  const [tax, setTax] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ApiOrder["paymentMethod"]>("Chuyển khoản");
  const [paymentStatus, setPaymentStatus] = useState<ApiOrder["paymentStatus"]>("unpaid");
  const [productPick, setProductPick] = useState<ApiProduct | null>(null);
  const [productSearchKey, setProductSearchKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const shippingFeeNum = Number(shippingFee) || 0;
  const taxNum = tax.trim() ? Number(tax) || 0 : 0;
  const total = subtotal + shippingFeeNum + taxNum;

  function addProductLine(product: ApiProduct) {
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.heroImage,
        price: product.price,
        quantity: 1,
      },
    ]);
    setProductPick(null);
    setProductSearchKey((k) => k + 1);
  }

  function addManualLine() {
    setItems((prev) => [...prev, { key: newKey(), slug: "", name: "", image: "", price: 0, quantity: 1 }]);
  }

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!selectedProvince || !selectedWard) {
      return setError("Vui lòng chọn Tỉnh/Thành phố và Phường/Xã.");
    }
    if (items.length === 0) {
      return setError("Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng.");
    }
    if (items.some((item) => !item.name.trim() || item.price <= 0 || item.quantity <= 0)) {
      return setError("Mỗi sản phẩm cần có tên, giá và số lượng hợp lệ.");
    }

    setSaving(true);
    try {
      const { order } = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        phone: phone.trim(),
        provinceCode: selectedProvince.code,
        provinceName: selectedProvince.fullName,
        wardCode: selectedWard.code,
        wardName: selectedWard.fullName,
        addressDetail: addressDetail.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name.trim(),
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingFee: shippingFeeNum,
        tax: tax.trim() ? taxNum : undefined,
        promotionCode: promotionCode.trim() || undefined,
        paymentMethod,
        paymentStatus,
      });
      onCreated(order);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Tạo đơn hàng thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={saving}
      labelledBy="create-order-modal-title"
      icon="add_shopping_cart"
      title="Tạo đơn hàng thủ công"
      subtitle="Nhập tay đơn hàng đặt qua điện thoại, Facebook, hoặc ngoài đời — không liên quan đến website."
      maxWidthClassName="max-w-3xl"
    >
      <form id="create-order-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
        <section className="space-y-3">
          <h3 className="font-label-md text-[13px] font-semibold text-on-surface">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel htmlFor="co-name" required>
                Họ và tên
              </FieldLabel>
              <input
                id="co-name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className={textFieldClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-phone" required>
                Số điện thoại
              </FieldLabel>
              <input
                id="co-phone"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                className={textFieldClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-email" required>
                Email
              </FieldLabel>
              <input
                id="co-email"
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Nếu khách không có, nhập email tạm"
                className={textFieldClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel htmlFor="co-province" required>
                Tỉnh / Thành phố
              </FieldLabel>
              <SearchCombobox<ApiProvince>
                id="co-province"
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
            <div>
              <FieldLabel htmlFor="co-ward" required>
                Phường / Xã
              </FieldLabel>
              <SearchCombobox<ApiWard>
                id="co-ward"
                required
                disabled={!selectedProvince}
                disabledPlaceholder="Chọn Tỉnh/Thành phố trước"
                placeholder="Tìm Phường/Xã..."
                selected={selectedWard}
                getKey={(w) => w.code}
                getLabel={(w) => w.fullName}
                onSearch={(query) => fetchWards(selectedProvince!.code, query)}
                onSelect={setSelectedWard}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-address">Địa chỉ cụ thể</FieldLabel>
              <input
                id="co-address"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Số nhà, tên đường..."
                className={textFieldClass}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-3 border-t border-outline-variant/20">
          <h3 className="font-label-md text-[13px] font-semibold text-on-surface">Sản phẩm</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchCombobox<ApiProduct>
              key={productSearchKey}
              id="co-product-search"
              placeholder="Tìm sản phẩm trong kho để thêm vào đơn..."
              selected={productPick}
              getKey={(p) => p.id}
              getLabel={(p) => p.name}
              onSearch={(query) => fetchProducts({ q: query, pageSize: 8 }).then((res) => res.items)}
              onSelect={(product) => {
                if (product) addProductLine(product);
              }}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addManualLine}
              className="shrink-0 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors font-label-md text-xs"
            >
              <Icon name="add" className="!text-[16px]" />
              Dòng thủ công
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-label-sm text-on-surface-variant">Chưa có sản phẩm nào trong đơn.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-2 bg-surface-container-low rounded-lg p-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.key, { name: e.target.value })}
                    placeholder="Tên sản phẩm"
                    className="flex-1 min-w-0 bg-white border-none rounded-lg px-2.5 py-2 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.price || ""}
                    onChange={(e) => updateItem(item.key, { price: Number(e.target.value) || 0 })}
                    placeholder="Giá"
                    className="w-28 shrink-0 bg-white border-none rounded-lg px-2.5 py-2 text-[13px] text-right ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-16 shrink-0 bg-white border-none rounded-lg px-2.5 py-2 text-[13px] text-right ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label="Xóa dòng"
                    className="shrink-0 p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Icon name="close" className="!text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 pt-3 border-t border-outline-variant/20">
          <h3 className="font-label-md text-[13px] font-semibold text-on-surface">Thanh toán & vận chuyển</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <FieldLabel htmlFor="co-shipping">Phí vận chuyển</FieldLabel>
              <input
                id="co-shipping"
                type="number"
                min={0}
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className={textFieldClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-tax">Thuế (nếu có)</FieldLabel>
              <input
                id="co-tax"
                type="number"
                min={0}
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0"
                className={textFieldClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-promo">Mã khuyến mãi</FieldLabel>
              <input
                id="co-promo"
                value={promotionCode}
                onChange={(e) => setPromotionCode(e.target.value)}
                placeholder="Không bắt buộc"
                className={textFieldClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="co-payment-method">Phương thức</FieldLabel>
              <SelectField
                id="co-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as ApiOrder["paymentMethod"])}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <div className="max-w-64">
            <FieldLabel htmlFor="co-payment-status">Trạng thái thanh toán</FieldLabel>
            <SelectField
              id="co-payment-status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as ApiOrder["paymentStatus"])}
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_STATUS_LABEL[status]}
                </option>
              ))}
            </SelectField>
          </div>
        </section>

        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 font-headline-sm text-headline-sm">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatVnd(total)}</span>
        </div>
      </form>

      <div className="shrink-0 border-t border-outline-variant/30 px-4 sm:px-6 py-3 bg-surface-container-lowest flex items-center justify-between gap-3">
        {error ? (
          <p className="flex items-center gap-1.5 text-error font-label-md text-xs min-w-0">
            <Icon name="error" className="shrink-0 !text-[16px]" />
            <span className="truncate">{error}</span>
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 font-label-md text-xs sm:text-sm text-on-surface-variant hover:bg-surface-container border border-outline-variant/60 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <Button type="submit" form="create-order-form" disabled={saving} className="px-5 py-2 text-xs sm:text-sm font-medium rounded-xl shadow-xs">
            {saving ? "Đang lưu..." : "Tạo đơn hàng"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
