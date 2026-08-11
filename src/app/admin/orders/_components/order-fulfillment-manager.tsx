"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { SearchCombobox } from "@/components/ui/search-combobox";
import { useToast } from "@/components/ui/toast";
import { ApiRequestError } from "@/lib/api-client";
import { splitOrder, updateOrderItems, updateOrderItemStatus } from "@/lib/api/orders";
import { fetchProducts } from "@/lib/api/products";
import { formatVnd } from "@/lib/format";
import type { ApiOrder, ApiProduct, ApiProductVariant } from "@/lib/api-types";
import { ORDER_STATUS_META } from "@/components/ui/order-status-badge";

const PRE_ORDER_STATUSES: ApiOrder["status"][] = [
  "deposit_received", "factory_ordered", "factory_shipped", "transit_warehouse", "vietnam_warehouse", "shop_warehouse", "shipped",
];

type Selection = { itemIndex: number; quantity: number };

export function OrderFulfillmentManager({ order, onUpdated }: { order: ApiOrder; onUpdated: (order: ApiOrder) => void }) {
  const { showToast } = useToast();
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [showSplit, setShowSplit] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState<ApiOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null | undefined>(undefined);
  const [itemName, setItemName] = useState("");
  const [itemSlug, setItemSlug] = useState("");
  const [itemProductId, setItemProductId] = useState<string | null>(null);
  const [itemVariant, setItemVariant] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [availableVariants, setAvailableVariants] = useState<ApiProductVariant[]>([]);
  const [productPick, setProductPick] = useState<ApiProduct | null>(null);
  const [productSearchKey, setProductSearchKey] = useState(0);
  const [savingItem, setSavingItem] = useState(false);
  const selectedValue = useMemo(() => selections.reduce((sum, selection) => sum + order.items[selection.itemIndex].price * selection.quantity, 0), [order.items, selections]);
  const ratio = order.subtotal > 0 ? selectedValue / order.subtotal : 0;
  const [newTotal, setNewTotal] = useState(0);
  const [newDeposit, setNewDeposit] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [originalDeposit, setOriginalDeposit] = useState(0);

  async function changeItemStatus(index: number, status: ApiOrder["status"]) {
    setSavingIndex(index);
    try {
      const response = await updateOrderItemStatus(order.id, index, status);
      onUpdated(response.order);
      setSelections((current) => current.filter((selection) => selection.itemIndex !== index || status === "shop_warehouse"));
      showToast("Đã cập nhật trạng thái sản phẩm.", "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Không thể cập nhật trạng thái sản phẩm.", "error");
    } finally {
      setSavingIndex(null);
    }
  }

  function openAddItem() {
    setEditingIndex(null); setItemName(""); setItemSlug(""); setItemProductId(null); setItemVariant(""); setItemImage(""); setItemPrice(0); setItemQuantity(1); setAvailableVariants([]); setProductPick(null); setProductSearchKey((key) => key + 1); setError(null);
  }

  function openEditItem(index: number) {
    const item = order.items[index];
    setEditingIndex(index); setItemName(item.name); setItemSlug(item.slug); setItemProductId(item.productId); setItemVariant(item.variantName); setItemImage(item.image); setItemPrice(item.price); setItemQuantity(item.quantity); setAvailableVariants([]); setProductPick(null); setProductSearchKey((key) => key + 1); setError(null);
  }

  function selectProduct(product: ApiProduct | null) {
    setProductPick(product);
    if (!product) return;
    const variant = product.variants[0];
    setItemProductId(product.id); setItemSlug(product.slug); setItemName(product.name); setItemVariant(variant?.name ?? ""); setItemImage(variant?.image || product.heroImage); setItemPrice(variant?.price ?? product.price); setAvailableVariants(product.variants);
  }

  function selectProductVariant(name: string) {
    const variant = availableVariants.find((value) => value.name === name);
    setItemVariant(name);
    if (variant) { setItemPrice(variant.price); setItemImage(variant.image || itemImage); }
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    if (editingIndex === undefined) return;
    if (!itemName.trim()) return setError("Vui lòng nhập tên sản phẩm.");
    const currentStatus = editingIndex === null ? order.status : order.items[editingIndex].itemStatus ?? order.status;
    const nextItem = { productId: itemProductId, slug: itemSlug, name: itemName.trim(), variantName: itemVariant.trim(), image: itemImage, price: itemPrice, quantity: itemQuantity, itemStatus: currentStatus };
    const nextItems = editingIndex === null ? [...order.items, nextItem] : order.items.map((item, index) => index === editingIndex ? nextItem : item);
    setSavingItem(true); setError(null);
    try {
      const response = await updateOrderItems(order.id, nextItems);
      onUpdated(response.order); setEditingIndex(undefined); showToast(editingIndex === null ? "Đã thêm sản phẩm." : "Đã sửa sản phẩm.", "success");
    } catch (err) { setError(err instanceof ApiRequestError ? err.message : "Không thể lưu sản phẩm."); }
    finally { setSavingItem(false); }
  }

  async function removeItem(index: number) {
    if (order.items.length === 1) return showToast("Đơn hàng phải có ít nhất một sản phẩm.", "error");
    if (!window.confirm(`Xóa ${order.items[index].name} khỏi đơn hàng?`)) return;
    setSavingIndex(index);
    try { const response = await updateOrderItems(order.id, order.items.filter((_, itemIndex) => itemIndex !== index)); onUpdated(response.order); setSelections([]); showToast("Đã xóa sản phẩm khỏi đơn.", "success"); }
    catch (err) { showToast(err instanceof ApiRequestError ? err.message : "Không thể xóa sản phẩm.", "error"); }
    finally { setSavingIndex(null); }
  }

  function toggleSelection(itemIndex: number, checked: boolean) {
    setSelections((current) => checked
      ? [...current, { itemIndex, quantity: order.items[itemIndex].quantity }]
      : current.filter((selection) => selection.itemIndex !== itemIndex));
  }

  function openSplit() {
    const nextNewTotal = Math.round(order.total * ratio);
    const nextNewDeposit = Math.round(order.depositAmount * ratio);
    setNewTotal(nextNewTotal);
    setNewDeposit(nextNewDeposit);
    setOriginalTotal(Math.max(0, order.total - nextNewTotal));
    setOriginalDeposit(Math.max(0, order.depositAmount - nextNewDeposit));
    setError(null);
    setShowSplit(true);
  }

  async function handleSplit(event: React.FormEvent) {
    event.preventDefault();
    if (newDeposit > newTotal || originalDeposit > originalTotal) return setError("Tiền cọc không được lớn hơn tổng tiền của từng đơn.");
    setSplitting(true);
    setError(null);
    try {
      const response = await splitOrder(order.id, {
        selections,
        newTotal,
        newDepositAmount: newDeposit,
        originalTotal,
        originalDepositAmount: originalDeposit,
      });
      onUpdated(response.originalOrder);
      setSelections([]);
      setSplitResult(response.newOrder);
      showToast(`Đã tạo đơn tách #${response.newOrder.publicCode.toUpperCase()}.`, "success");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Không thể tách đơn hàng.");
    } finally {
      setSplitting(false);
    }
  }

  const moneyMismatch = newTotal + originalTotal !== order.total || newDeposit + originalDeposit !== order.depositAmount;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 px-5 py-4">
          <div><h2 className="font-headline-sm text-headline-sm text-on-surface">Sản phẩm và tiến độ</h2><p className="mt-1 text-xs text-on-surface-variant">Mỗi sản phẩm hoặc biến thể có thể có trạng thái riêng</p></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={openAddItem}><Icon name="add" className="!text-[17px]" />Thêm sản phẩm</Button>
            {order.orderType === "pre_order" && <Button size="sm" disabled={selections.length === 0} onClick={openSplit}><Icon name="call_split" className="!text-[17px]" />Tách {selections.length > 0 ? selections.length : ""} sản phẩm</Button>}
          </div>
        </div>
        <ul className="divide-y divide-outline-variant/10">
          {order.items.map((item, index) => {
            const itemStatus = item.itemStatus ?? order.status;
            const canSplit = order.orderType === "pre_order" && itemStatus === "shop_warehouse";
            const selection = selections.find((candidate) => candidate.itemIndex === index);
            return (
              <li key={`${item.productId ?? item.slug}-${item.variantName}-${index}`} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_minmax(210px,280px)] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  {order.orderType === "pre_order" && <input type="checkbox" checked={Boolean(selection)} disabled={!canSplit} onChange={(event) => toggleSelection(index, event.target.checked)} aria-label={`Chọn ${item.name} để tách đơn`} className="h-4 w-4 accent-primary disabled:opacity-30" />}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-outline-variant/30 bg-white"><Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill sizes="56px" className="object-contain p-1" /></div>
                  <div className="min-w-0 flex-1">
                    {item.slug ? <Link href={`/products/${item.slug}`} target="_blank" className="line-clamp-1 font-medium hover:text-primary">{item.name}</Link> : <p className="line-clamp-1 font-medium">{item.name}</p>}
                    {item.variantName && <p className="truncate text-xs font-medium text-primary">Biến thể: {item.variantName}</p>}
                    <p className="text-xs text-on-surface-variant">{formatVnd(item.price)} × {item.quantity} = <strong>{formatVnd(item.price * item.quantity)}</strong></p>
                    {selection && item.quantity > 1 && <label className="mt-2 flex items-center gap-2 text-xs">Số lượng tách<input type="number" min={1} max={item.quantity} value={selection.quantity} onChange={(event) => setSelections((current) => current.map((value) => value.itemIndex === index ? { ...value, quantity: Math.min(item.quantity, Math.max(1, Number(event.target.value) || 1)) } : value))} className="w-16 rounded-lg bg-surface-container-low px-2 py-1 ring-1 ring-outline-variant/40" /></label>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                {order.orderType === "pre_order" ? (
                  <div className="flex min-w-[210px] flex-1 items-center gap-2">
                    <SelectField value={itemStatus} disabled={savingIndex === index} onChange={(event) => void changeItemStatus(index, event.target.value as ApiOrder["status"])} className="!rounded-xl !bg-surface-container-low !px-3 !py-2 text-sm">
                      {PRE_ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_META[status].label}</option>)}
                    </SelectField>
                    {savingIndex === index && <Icon name="progress_activity" className="animate-spin text-primary" />}
                  </div>
                ) : <span className="mr-auto w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{ORDER_STATUS_META[itemStatus].label}</span>}
                  <button type="button" onClick={() => openEditItem(index)} className="rounded-lg p-2 text-primary hover:bg-primary/10" aria-label={`Sửa ${item.name}`}><Icon name="edit" className="!text-[18px]" /></button>
                  <button type="button" disabled={savingIndex === index} onClick={() => void removeItem(index)} className="rounded-lg p-2 text-error hover:bg-error/10 disabled:opacity-40" aria-label={`Xóa ${item.name}`}><Icon name="delete" className="!text-[18px]" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {editingIndex !== undefined && (
        <Modal onClose={() => !savingItem && setEditingIndex(undefined)} closeDisabled={savingItem} labelledBy="order-item-editor-title" icon={editingIndex === null ? "add" : "edit"} title={editingIndex === null ? "Thêm sản phẩm" : "Sửa sản phẩm"} subtitle="Tổng tiền cuối cùng của đơn vẫn có thể chỉnh riêng" maxWidthClassName="sm:max-w-[640px]">
          <form onSubmit={saveItem} className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-on-surface-variant">Chọn sản phẩm trên website</label>
              <SearchCombobox<ApiProduct> key={productSearchKey} id="order-item-product-search" placeholder="Tìm sản phẩm để thêm hoặc thay thế..." selected={productPick} getKey={(product) => product.id} getLabel={(product) => `${product.name} · ${formatVnd(product.price)}`} onSearch={(query) => fetchProducts({ q: query, pageSize: 8 }).then((response) => response.items)} onSelect={selectProduct} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-on-surface-variant sm:col-span-2">Tên sản phẩm<input required value={itemName} onChange={(event) => setItemName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm" /></label>
              {availableVariants.length > 0 ? <label className="text-xs text-on-surface-variant">Biến thể<SelectField value={itemVariant} onChange={(event) => selectProductVariant(event.target.value)} className="mt-1 !px-3 !py-2.5 text-sm">{availableVariants.map((variant, index) => <option key={`${variant.name}-${index}`} value={variant.name}>{variant.name}</option>)}</SelectField></label> : <label className="text-xs text-on-surface-variant">Biến thể<input value={itemVariant} onChange={(event) => setItemVariant(event.target.value)} placeholder="Có thể để trống" className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm" /></label>}
              <label className="text-xs text-on-surface-variant">Giá<input required type="number" min={0} value={itemPrice} onChange={(event) => setItemPrice(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm" /></label>
              <div className="text-xs text-on-surface-variant"><span>Số lượng</span><div className="mt-1 grid grid-cols-[40px_1fr_40px] overflow-hidden rounded-xl bg-surface-container-low"><button type="button" onClick={() => setItemQuantity((value) => Math.max(1, value - 1))} className="text-lg hover:bg-primary/10" aria-label="Giảm số lượng">−</button><input required type="number" min={1} value={itemQuantity} onChange={(event) => setItemQuantity(Math.max(1, Number(event.target.value) || 1))} className="min-w-0 border-x border-outline-variant/30 bg-transparent px-2 py-2.5 text-center text-sm outline-none" /><button type="button" onClick={() => setItemQuantity((value) => value + 1)} className="text-lg text-primary hover:bg-primary/10" aria-label="Tăng số lượng">+</button></div></div>
              <label className="text-xs text-on-surface-variant">Ảnh sản phẩm<input value={itemImage} onChange={(event) => setItemImage(event.target.value)} placeholder="URL ảnh" className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm" /></label>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3 text-sm">Thành tiền sản phẩm: <strong className="text-primary">{formatVnd(itemPrice * itemQuantity)}</strong></div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2"><button type="button" disabled={savingItem} onClick={() => setEditingIndex(undefined)} className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-bold">Hủy</button><Button type="submit" disabled={savingItem}>{savingItem ? "Đang lưu..." : "Lưu sản phẩm"}</Button></div>
          </form>
        </Modal>
      )}

      {showSplit && (
        <Modal onClose={() => !splitting && setShowSplit(false)} closeDisabled={splitting} labelledBy="split-order-title" icon="call_split" title={splitResult ? "Đã tách đơn hàng" : "Tách sản phẩm thành đơn mới"} subtitle={splitResult ? `Mã đơn mới #${splitResult.publicCode.toUpperCase()}` : `${selections.length} dòng · Giá trị sản phẩm ${formatVnd(selectedValue)}`} maxWidthClassName="sm:max-w-[640px]">
          {splitResult ? (
            <div className="space-y-4 p-6"><p className="rounded-2xl bg-primary/5 p-4 text-sm">Đơn mới là hàng có sẵn và đang ở trạng thái <strong>Đang đóng hàng</strong>.</p><div className="flex justify-end gap-2"><Link href={`/admin/orders/${splitResult.id}`} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary">Mở đơn mới</Link><button type="button" onClick={() => setShowSplit(false)} className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-bold">Đóng</button></div></div>
          ) : (
            <form onSubmit={handleSplit} className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyGroup title="Đơn mới (hàng có sẵn)" total={newTotal} setTotal={setNewTotal} deposit={newDeposit} setDeposit={setNewDeposit} />
                <MoneyGroup title="Đơn order còn lại" total={originalTotal} setTotal={setOriginalTotal} deposit={originalDeposit} setDeposit={setOriginalDeposit} />
              </div>
              <p className={`rounded-xl p-3 text-xs ${moneyMismatch ? "bg-error/10 text-error" : "bg-[#dcfce7] text-[#15803d]"}`}>{moneyMismatch ? "Tổng tiền hoặc tiền cọc sau khi chia đang khác đơn ban đầu. Bạn vẫn có thể xác nhận nếu đây là chủ ý." : "Tổng tiền và tiền cọc đang khớp với đơn ban đầu."}</p>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex justify-end gap-2"><button type="button" disabled={splitting} onClick={() => setShowSplit(false)} className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-bold">Hủy</button><Button type="submit" disabled={splitting}>{splitting ? "Đang tách..." : "Xác nhận tách đơn"}</Button></div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

function MoneyGroup({ title, total, setTotal, deposit, setDeposit }: { title: string; total: number; setTotal: (value: number) => void; deposit: number; setDeposit: (value: number) => void }) {
  return <fieldset className="space-y-3 rounded-2xl bg-surface-container-low p-4"><legend className="px-1 text-sm font-bold">{title}</legend><label className="block text-xs text-on-surface-variant">Tổng tiền<input type="number" min={0} value={total} onChange={(event) => setTotal(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-outline-variant/40" /></label><label className="block text-xs text-on-surface-variant">Tiền đặt cọc<input type="number" min={0} value={deposit} onChange={(event) => setDeposit(Math.max(0, Number(event.target.value) || 0))} className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-outline-variant/40" /></label><p className="text-xs">Còn lại: <strong className="text-primary">{formatVnd(Math.max(0, total - deposit))}</strong></p></fieldset>;
}
