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
import { ApiRequestError } from "@/lib/api-client";
import type { ApiOrder, ApiProduct } from "@/lib/api-types";

type DraftItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  variantName: string;
  image: string;
  price: number;
  quantity: number;
  variants: ApiProduct["variants"];
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

export function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: (order: ApiOrder) => void }) {
  const [orderType, setOrderType] = useState<ApiOrder["orderType"]>("pre_order");
  const [facebookName, setFacebookName] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [totalOverride, setTotalOverride] = useState("");
  const [depositAmount, setDepositAmount] = useState("0");
  const [productPick, setProductPick] = useState<ApiProduct | null>(null);
  const [productSearchKey, setProductSearchKey] = useState(0);
  const [createdOrder, setCreatedOrder] = useState<ApiOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const total = totalOverride === "" ? subtotal : Math.max(0, Number(totalOverride) || 0);
  const deposit = Math.max(0, Number(depositAmount) || 0);
  const remaining = Math.max(0, total - deposit);

  function addProduct(product: ApiProduct) {
    const firstVariant = product.variants[0];
    setItems((previous) => [
      ...previous,
      {
        key: newKey(),
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: firstVariant?.name ?? "",
        image: firstVariant?.image || product.heroImage,
        price: firstVariant?.price ?? product.price,
        quantity: 1,
        variants: product.variants,
      },
    ]);
    setProductPick(null);
    setProductSearchKey((key) => key + 1);
  }

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((previous) => previous.map((item) => (item.key === key ? { ...item, ...patch } : item)));
    setTotalOverride("");
  }

  function selectVariant(item: DraftItem, variantName: string) {
    const variant = item.variants.find((candidate) => candidate.name === variantName);
    updateItem(item.key, {
      variantName,
      price: variant?.price ?? item.price,
      image: variant?.image || item.image,
    });
  }

  function shareUrl(order: ApiOrder) {
    return `${window.location.origin}/theo-doi-don-hang/${order.publicCode}`;
  }

  async function handleShare() {
    if (!createdOrder) return;
    const url = shareUrl(createdOrder);
    const text = `Theo dõi đơn hàng #${createdOrder.publicCode.toUpperCase()} của ZENOST: ${url}`;
    if (navigator.share) {
      await navigator.share({ title: `Đơn hàng #${createdOrder.publicCode.toUpperCase()}`, text, url });
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (items.length === 0) return setError("Vui lòng chọn ít nhất một sản phẩm.");
    if (deposit > total) return setError("Số tiền đặt cọc không được lớn hơn tổng tiền.");

    setSaving(true);
    try {
      const { order } = await createOrder({
        orderType,
        facebookName: facebookName.trim(),
        facebookUrl: facebookUrl.trim(),
        phone: phone.trim() || undefined,
        addressDetail: addressDetail.trim(),
        items: items.map(({ productId, slug, name, variantName, image, price, quantity }) => ({
          productId,
          slug,
          name,
          variantName,
          image,
          price,
          quantity,
        })),
        total,
        depositAmount: deposit,
      });
      setCreatedOrder(order);
      onCreated(order);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Tạo đơn hàng thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (createdOrder) {
    return (
      <Modal onClose={onClose} labelledBy="created-order-title" icon="check_circle" title="Đã tạo đơn hàng" subtitle={`Mã đơn #${createdOrder.publicCode.toUpperCase()}`} maxWidthClassName="sm:max-w-[512px]">
        <div className="space-y-5 px-4 py-6 sm:px-6">
          <div className="rounded-2xl bg-primary/5 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Mã theo dõi</p>
            <p className="mt-2 font-display-lg text-4xl uppercase tracking-[0.18em] text-primary">{createdOrder.publicCode}</p>
            <p className="mt-3 text-sm text-on-surface-variant">Khách có thể xem trạng thái mà không cần đăng nhập.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => void handleShare()} className="flex-1">
              <Icon name="share" />
              {copied ? "Đã sao chép" : "Chia sẻ đơn hàng"}
            </Button>
            <button type="button" onClick={onClose} className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} closeDisabled={saving} labelledBy="create-order-modal-title" icon="add_shopping_cart" title="Tạo đơn Facebook" subtitle="Tạo thủ công từ cuộc trò chuyện với khách" maxWidthClassName="sm:max-w-[768px]">
      <form id="create-order-form" onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
        <section className="space-y-3">
          <h3 className="text-[13px] font-semibold text-on-surface">Thông tin đơn và khách Facebook</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="co-type" required>Loại đơn</FieldLabel>
              <SelectField id="co-type" value={orderType} onChange={(event) => setOrderType(event.target.value as ApiOrder["orderType"])}>
                <option value="in_stock">Hàng có sẵn</option>
                <option value="pre_order">Hàng order</option>
              </SelectField>
            </div>
            <div>
              <FieldLabel htmlFor="co-facebook-name" required>Tên Facebook khách</FieldLabel>
              <input id="co-facebook-name" required value={facebookName} onChange={(event) => setFacebookName(event.target.value)} placeholder="Tên hiển thị trên Facebook" className={textFieldClass} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="co-facebook-url" required>Link Facebook khách</FieldLabel>
              <input id="co-facebook-url" required type="url" value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://www.facebook.com/..." className={textFieldClass} />
            </div>
            <div>
              <FieldLabel htmlFor="co-phone">Số điện thoại — có thể thêm sau</FieldLabel>
              <input id="co-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={textFieldClass} />
            </div>
            <div>
              <FieldLabel htmlFor="co-address">Địa chỉ — có thể thêm sau</FieldLabel>
              <input id="co-address" value={addressDetail} onChange={(event) => setAddressDetail(event.target.value)} className={textFieldClass} />
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-outline-variant/20 pt-4">
          <div><h3 className="text-[13px] font-semibold text-on-surface">Sản phẩm</h3><p className="mt-1 text-xs text-on-surface-variant">Mỗi sản phẩm hoặc biến thể có thể nhập số lượng từ 1 trở lên.</p></div>
          <SearchCombobox<ApiProduct>
            key={productSearchKey}
            id="co-product-search"
            placeholder="Tìm và chọn sản phẩm trên website..."
            selected={productPick}
            getKey={(product) => product.id}
            getLabel={(product) => `${product.name} · ${formatVnd(product.price)}`}
            onSearch={(query) => fetchProducts({ q: query, pageSize: 8 }).then((response) => response.items)}
            onSelect={(product) => product && addProduct(product)}
          />
          {items.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Chưa chọn sản phẩm.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-1 items-end gap-2 rounded-xl bg-surface-container-low p-3 sm:grid-cols-[minmax(0,1fr)_minmax(130px,180px)_110px_128px_32px]">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  {item.variants.length > 0 ? (
                    <label className="min-w-0 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Biến thể<select value={item.variantName} onChange={(event) => selectVariant(item, event.target.value)} aria-label={`Biến thể ${item.name}`} className="mt-1 w-full min-w-0 rounded-lg bg-white px-2 py-2 text-xs font-normal normal-case tracking-normal text-on-surface ring-1 ring-outline-variant">
                      {item.variants.map((variant, index) => <option key={`${variant.name}-${index}`} value={variant.name}>{variant.name}</option>)}
                    </select></label>
                  ) : (
                    <span className="text-xs text-on-surface-variant">Không có biến thể</span>
                  )}
                  <label className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Giá<input type="number" min={0} value={item.price} onChange={(event) => updateItem(item.key, { price: Number(event.target.value) || 0 })} aria-label={`Giá ${item.name}`} className="mt-1 w-full rounded-lg bg-white px-2 py-2 text-right text-xs ring-1 ring-outline-variant" /></label>
                  <div><span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Số lượng</span><div className="mt-1 grid grid-cols-[32px_1fr_32px] overflow-hidden rounded-lg bg-white ring-1 ring-outline-variant"><button type="button" onClick={() => updateItem(item.key, { quantity: Math.max(1, item.quantity - 1) })} className="text-lg text-on-surface-variant hover:bg-primary/10" aria-label={`Giảm số lượng ${item.name}`}>−</button><input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(item.key, { quantity: Math.max(1, Number(event.target.value) || 1) })} aria-label={`Số lượng ${item.name}`} className="min-w-0 border-x border-outline-variant/40 bg-white px-1 py-2 text-center text-xs outline-none" /><button type="button" onClick={() => updateItem(item.key, { quantity: item.quantity + 1 })} className="text-lg text-primary hover:bg-primary/10" aria-label={`Tăng số lượng ${item.name}`}>+</button></div></div>
                  <button type="button" onClick={() => { setItems((previous) => previous.filter((candidate) => candidate.key !== item.key)); setTotalOverride(""); }} aria-label={`Xóa ${item.name}`} className="text-on-surface-variant hover:text-error"><Icon name="close" /></button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 border-t border-outline-variant/20 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel htmlFor="co-total">Tổng tiền — có thể sửa</FieldLabel>
              <input id="co-total" type="number" min={0} value={totalOverride} onChange={(event) => setTotalOverride(event.target.value)} placeholder={String(subtotal)} className={textFieldClass} />
              <p className="mt-1 text-xs text-on-surface-variant">Tự cộng: {formatVnd(subtotal)}</p>
            </div>
            <div>
              <FieldLabel htmlFor="co-deposit">Số tiền đặt cọc</FieldLabel>
              <input id="co-deposit" type="number" min={0} max={total} value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} className={textFieldClass} />
            </div>
            <div>
              <FieldLabel>Số tiền còn lại</FieldLabel>
              <div className="rounded-xl bg-surface-container-low px-3.5 py-2.5 font-bold text-primary">{formatVnd(remaining)}</div>
            </div>
          </div>
        </section>
      </form>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 sm:px-6">
        {error ? <p className="text-xs text-error">{error}</p> : <span />}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-outline-variant/60 px-4 py-2 text-sm text-on-surface-variant">Hủy</button>
          <Button type="submit" form="create-order-form" disabled={saving}>{saving ? "Đang lưu..." : "Tạo đơn hàng"}</Button>
        </div>
      </div>
    </Modal>
  );
}
