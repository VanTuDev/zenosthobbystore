"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ORDER_STATUS_META } from "@/components/ui/order-status-badge";
import { ApiRequestError } from "@/lib/api-client";
import { fetchOrderedProductsSummary, fetchOrdersForOrderedProduct, updateFactoryOrderedQuantity, type OrderedProductOrder, type OrderedProductSummary } from "@/lib/api/orders";

export function OrderedProductsManager() {
  const [items, setItems] = useState<OrderedProductSummary[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderedProductSummary | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<OrderedProductOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOrderedProductsSummary()
      .then((response) => { if (!cancelled) { setItems(response.items); setTotalQuantity(response.totalQuantity); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiRequestError ? err.message : "Không thể tải thống kê sản phẩm đang order."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    if (!normalized) return items;
    return items.filter((item) => `${item.name} ${item.variantName}`.toLocaleLowerCase("vi").includes(normalized));
  }, [items, query]);
  const totalFactoryOrdered = useMemo(() => items.reduce((sum, item) => sum + item.factoryOrderedQuantity, 0), [items]);
  const totalSurplus = totalFactoryOrdered - totalQuantity;

  function updateSavedQuantity(item: OrderedProductSummary, orderedQuantity: number) {
    setItems((current) => current.map((value) =>
      (value.productId ?? value.slug) === (item.productId ?? item.slug) && value.variantName === item.variantName
        ? { ...value, factoryOrderedQuantity: orderedQuantity, surplusQuantity: orderedQuantity - value.quantity }
        : value));
  }

  async function showRelatedOrders(item: OrderedProductSummary) {
    setSelectedItem(item);
    setRelatedOrders([]);
    setOrdersError(null);
    setOrdersLoading(true);
    try {
      const response = await fetchOrdersForOrderedProduct(item.productId ?? item.slug, item.variantName);
      setRelatedOrders(response.orders);
    } catch (err) {
      setOrdersError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách đơn hàng.");
    } finally {
      setOrdersLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface-container-low px-5 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-white px-4 py-2 ring-1 ring-outline-variant/30"><p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Sản phẩm/biến thể</p><p className="mt-1 text-xl font-bold text-on-surface">{items.length.toLocaleString("vi-VN")}</p></div>
          <div className="rounded-xl bg-white px-4 py-2 ring-1 ring-outline-variant/30"><p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Khách đã order</p><p className="mt-1 text-xl font-bold text-primary">{totalQuantity.toLocaleString("vi-VN")}</p></div>
          <div className="rounded-xl bg-white px-4 py-2 ring-1 ring-outline-variant/30"><p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Đã đặt với xưởng</p><p className="mt-1 text-xl font-bold text-on-surface">{totalFactoryOrdered.toLocaleString("vi-VN")}</p></div>
          <div className={`rounded-xl px-4 py-2 ${totalSurplus >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-error/10 text-error"}`}><p className="text-[10px] font-bold uppercase tracking-wide opacity-75">Tổng dư/thiếu</p><p className="mt-1 text-xl font-bold">{totalSurplus > 0 ? "+" : ""}{totalSurplus.toLocaleString("vi-VN")}</p></div>
        </div>
        <label className="relative min-w-[260px] flex-1 sm:max-w-sm"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-[18px]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm hoặc biến thể..." className="w-full rounded-xl bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary" /></label>
      </div>

      {error && <p className="m-5 rounded-xl bg-error/10 p-3 text-sm text-error">{error}</p>}
      {loading ? <p className="p-8 text-center text-on-surface-variant">Đang tải thống kê…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-white text-[10px] uppercase tracking-wide text-on-surface-variant"><tr><th className="border-b border-outline-variant/30 px-5 py-3">Sản phẩm</th><th className="border-b border-outline-variant/30 px-4 py-3">Biến thể</th><th className="border-b border-outline-variant/30 px-4 py-3 text-right">Số đơn</th><th className="border-b border-outline-variant/30 px-4 py-3 text-right">Khách order</th><th className="border-b border-outline-variant/30 px-4 py-3 text-center">Đặt với xưởng</th><th className="border-b border-outline-variant/30 px-5 py-3 text-right">Dư / thiếu</th></tr></thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredItems.map((item) => <tr key={`${item.productId ?? item.slug}-${item.variantName}`} className="hover:bg-primary/5"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-outline-variant/30 bg-white"><Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill sizes="48px" className="object-contain p-1" /></div>{item.slug ? <Link href={`/products/${item.slug}`} target="_blank" className="font-medium hover:text-primary">{item.name}</Link> : <span className="font-medium">{item.name}</span>}</div></td><td className="px-4 py-3 text-on-surface-variant">{item.variantName || "Không có biến thể"}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => void showRelatedOrders(item)} className="rounded-lg px-2 py-1 font-bold text-primary underline decoration-primary/40 underline-offset-4 hover:bg-primary/10" title="Xem các đơn hàng có sản phẩm này">{item.orderCount}</button></td><td className="px-4 py-3 text-right text-xl font-bold text-primary">{item.quantity}</td><td className="px-4 py-3"><FactoryQuantityCell item={item} onSaved={updateSavedQuantity} /></td><td className={`px-5 py-3 text-right text-xl font-bold ${item.surplusQuantity >= 0 ? "text-[#15803d]" : "text-error"}`}>{item.surplusQuantity > 0 ? "+" : ""}{item.surplusQuantity}</td></tr>)}
              {filteredItems.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">{query ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào đang order."}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
          <section role="dialog" aria-modal="true" aria-label="Danh sách đơn hàng" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-outline-variant/30 px-5 py-4">
              <div><p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Các đơn hàng có sản phẩm</p><h3 className="mt-1 text-lg font-bold text-on-surface">{selectedItem.name}</h3><p className="text-sm text-on-surface-variant">Biến thể: {selectedItem.variantName || "Không có biến thể"}</p></div>
              <button type="button" onClick={() => setSelectedItem(null)} className="rounded-full p-2 hover:bg-surface-container-low" aria-label="Đóng"><Icon name="close" /></button>
            </header>
            <div className="max-h-[65vh] overflow-y-auto p-5">
              {ordersLoading && <p className="py-8 text-center text-on-surface-variant">Đang tải danh sách đơn hàng…</p>}
              {ordersError && <p className="rounded-xl bg-error/10 p-3 text-sm text-error">{ordersError}</p>}
              {!ordersLoading && !ordersError && <div className="space-y-2">{relatedOrders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-outline-variant/30 p-3 hover:border-primary hover:bg-primary/5"><span className="font-bold text-primary">#{order.publicCode.toUpperCase()}</span><div className="min-w-0"><p className="truncate font-medium text-on-surface">{order.facebookName}</p><p className="text-xs text-on-surface-variant">{ORDER_STATUS_META[order.status].label}</p></div><div className="flex items-center gap-2"><span className="rounded-lg bg-surface-container-low px-2.5 py-1 text-sm font-bold">SL {order.quantity}</span><Icon name="chevron_right" className="text-on-surface-variant" /></div></Link>)}{relatedOrders.length === 0 && <p className="py-8 text-center text-on-surface-variant">Không còn đơn hàng phù hợp.</p>}</div>}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function FactoryQuantityCell({ item, onSaved }: { item: OrderedProductSummary; onSaved: (item: OrderedProductSummary, quantity: number) => void }) {
  const [value, setValue] = useState(item.factoryOrderedQuantity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  async function save() {
    const quantity = Math.max(0, value);
    setSaving(true); setSaved(false); setSaveError(false);
    try {
      await updateFactoryOrderedQuantity(item.productId ?? item.slug, item.variantName, quantity);
      onSaved(item, quantity); setSaved(true);
    } catch { setSaveError(true); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto flex w-fit items-center gap-1"><input type="number" min={0} value={value} onChange={(event) => { setValue(Math.max(0, Number(event.target.value) || 0)); setSaved(false); setSaveError(false); }} className={`w-20 rounded-lg bg-surface-container-low px-2 py-2 text-center font-bold outline-none ring-1 focus:ring-2 ${saveError ? "ring-error focus:ring-error" : "ring-outline-variant/40 focus:ring-primary"}`} aria-label={`Số lượng đặt xưởng ${item.name} ${item.variantName}`} /><button type="button" onClick={() => void save()} disabled={saving || value === item.factoryOrderedQuantity} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-35 ${saveError ? "bg-error text-on-error" : saved ? "bg-[#dcfce7] text-[#15803d]" : "bg-primary text-on-primary"}`} title={saveError ? "Lưu thất bại, hãy thử lại" : "Lưu số lượng đặt với xưởng"}><Icon name={saving ? "progress_activity" : saveError ? "error" : saved ? "check" : "save"} className={`!text-[17px] ${saving ? "animate-spin" : ""}`} /></button></div>;
}
