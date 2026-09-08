"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import type { ApiProduct } from "@/lib/api-types";

type QuoteLine = {
  key: string;
  variantIndex: number;
  name: string;
  image: string;
  price: number;
  deposit: number;
  sortOrder: number;
};

function initialLines(product: ApiProduct): QuoteLine[] {
  return product.variants.map((variant, variantIndex) => ({
    key: `${variantIndex}-${variant.name}`,
    variantIndex,
    name: variant.name,
    image: variant.image || product.heroImage,
    price: variant.price,
    deposit: 0,
    sortOrder: variantIndex + 1,
  }));
}

export function QuoteBuilder({ product }: { product: ApiProduct }) {
  const [lines, setLines] = useState<QuoteLine[]>(() => initialLines(product));
  const [variantToAdd, setVariantToAdd] = useState("");
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);

  const selectedIndexes = useMemo(() => new Set(lines.map((line) => line.variantIndex)), [lines]);
  const availableVariants = product.variants
    .map((variant, index) => ({ variant, index }))
    .filter(({ index }) => !selectedIndexes.has(index));
  const totalPrice = lines.reduce((sum, line) => sum + line.price, 0);
  const totalDeposit = lines.reduce((sum, line) => sum + line.deposit, 0);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(lines.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visibleLines = lines.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function applySortOrder() {
    setLines((current) => [...current].sort((a, b) => a.sortOrder - b.sortOrder || a.variantIndex - b.variantIndex));
    setPage(0);
  }

  function updateLine(key: string, field: "price" | "deposit", value: number) {
    setLines((current) => current.map((line) => (
      line.key === key ? { ...line, [field]: Math.max(0, Math.round(value || 0)) } : line
    )));
  }

  function addVariant() {
    const index = Number(variantToAdd);
    const variant = product.variants[index];
    if (!variant || selectedIndexes.has(index)) return;
    setLines((current) => [...current, {
      key: `${index}-${variant.name}`,
      variantIndex: index,
      name: variant.name,
      image: variant.image || product.heroImage,
      price: variant.price,
      deposit: 0,
      sortOrder: Math.max(0, ...current.map((line) => line.sortOrder)) + 1,
    }]);
    setVariantToAdd("");
  }

  async function copyQuote() {
    const detail = lines.map((line, index) => (
      `${index + 1}. ${line.name}: ${formatVnd(line.price)} - Cọc ${formatVnd(line.deposit)}`
    ));
    const content = [
      `BÁO GIÁ - ${product.name}`,
      "",
      ...detail,
      "",
      `Tổng tiền: ${formatVnd(totalPrice)}`,
      `Tổng tiền cọc: ${formatVnd(totalDeposit)}`,
      `Còn lại: ${formatVnd(Math.max(0, totalPrice - totalDeposit))}`,
    ].join("\n");
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1480px] px-4 pb-8 pt-24 md:px-6">
      <div className="mb-3 flex justify-end gap-2">
          <Link href={`/products/${encodeURIComponent(product.slug)}`} className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm font-semibold hover:bg-surface-container-low">
            <Icon name="arrow_back" className="!text-[18px]" /> Sản phẩm
          </Link>
          <button type="button" onClick={() => void copyQuote()} disabled={lines.length === 0} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50">
            <Icon name={copied ? "check" : "content_copy"} className="!text-[18px]" /> {copied ? "Đã copy" : "Copy báo giá"}
          </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-outline-variant/30 bg-surface-container-low p-3 sm:flex-row sm:items-center">
          <select value={variantToAdd} onChange={(event) => setVariantToAdd(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="">{availableVariants.length ? "Chọn biến thể để thêm lại" : "Đã hiển thị tất cả biến thể"}</option>
            {availableVariants.map(({ variant, index }) => <option key={`${variant.name}-${index}`} value={index}>{variant.name}</option>)}
          </select>
          <button type="button" onClick={addVariant} disabled={!variantToAdd} className="inline-flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-45">
            <Icon name="add" className="!text-[18px]" /> Thêm biến thể
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="p-10 text-center text-on-surface-variant">
            <Icon name="request_quote" className="mb-2 !text-[42px] text-outline" />
            <p>Hãy thêm ít nhất một biến thể để tạo báo giá.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-flow-col xl:grid-cols-5 xl:grid-rows-4">
            {visibleLines.map((line) => (
              <article
                key={line.key}
                className="min-w-0 rounded-xl border border-outline-variant/30 bg-white p-3"
              >
                <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                  <h2 className="truncate text-sm font-bold" title={line.name}>{line.name}</h2>
                  <button type="button" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))} aria-label={`Xóa ${line.name}`} className="shrink-0 rounded-lg p-1.5 text-error hover:bg-error/10">
                    <Icon name="delete" className="!text-[17px]" />
                  </button>
                </div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-lg border border-outline-variant/25 bg-white">
                    <Image src={line.image || "/placeholder-product.svg"} alt={line.name} fill sizes="72px" className="object-contain" />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                      <span>Giá</span>
                      <span className="relative mt-0.5 block">
                        <input type="number" min={0} value={line.price} onChange={(event) => updateLine(line.key, "price", Number(event.target.value))} aria-label={`Giá ${line.name}`} className="w-full rounded-lg bg-surface-container-low py-1.5 pl-2 pr-6 text-right text-sm font-bold normal-case tracking-normal text-on-surface outline-none ring-1 ring-transparent focus:ring-primary" />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-sm font-medium normal-case text-on-surface-variant">đ</span>
                      </span>
                    </label>
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <span>Cọc</span>
                      <span className="relative mt-0.5 block">
                        <input type="number" min={0} max={line.price} value={line.deposit} onChange={(event) => updateLine(line.key, "deposit", Math.min(line.price, Number(event.target.value)))} aria-label={`Tiền cọc ${line.name}`} className="w-full rounded-lg bg-primary/5 py-1.5 pl-2 pr-6 text-right text-sm font-bold normal-case tracking-normal text-primary outline-none ring-1 ring-transparent focus:ring-primary" />
                        <span className="pointer-events-none absolute right-2 top-1.5 text-sm font-medium normal-case text-primary">đ</span>
                      </span>
                    </label>
                    <label className="flex items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                      <span>Thứ tự</span>
                      <input
                        type="number"
                        min={1}
                        value={line.sortOrder}
                        onChange={(event) => setLines((current) => current.map((item) => item.key === line.key ? { ...item, sortOrder: Math.max(1, Number(event.target.value) || 1) } : item))}
                        onBlur={applySortOrder}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                        aria-label={`Thứ tự ${line.name}`}
                        className="w-14 rounded-md bg-surface-container-low px-2 py-1 text-center text-xs font-bold normal-case tracking-normal text-on-surface outline-none ring-1 ring-transparent focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-outline-variant/25 bg-surface-container-low px-3 py-2">
            <button type="button" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0} aria-label="Trang báo giá trước" className="rounded-lg border border-outline-variant/40 bg-white p-1.5 text-primary disabled:opacity-35">
              <Icon name="chevron_left" className="!text-[20px]" />
            </button>
            <span className="text-xs font-semibold text-on-surface-variant">Trang {safePage + 1}/{totalPages} · tối đa 20 biến thể</span>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))} disabled={safePage >= totalPages - 1} aria-label="Trang báo giá tiếp theo" className="rounded-lg border border-outline-variant/40 bg-white p-1.5 text-primary disabled:opacity-35">
              <Icon name="chevron_right" className="!text-[20px]" />
            </button>
          </div>
        )}

        <footer className="grid gap-2 border-t border-outline-variant/30 bg-on-surface px-4 py-3 text-white sm:grid-cols-3">
          <p className="flex justify-between gap-3 sm:block"><span className="text-sm text-white/65">Tổng tiền</span><strong className="sm:block sm:text-lg">{formatVnd(totalPrice)}</strong></p>
          <p className="flex justify-between gap-3 sm:block"><span className="text-sm text-white/65">Tổng tiền cọc</span><strong className="text-primary-fixed sm:block sm:text-lg">{formatVnd(totalDeposit)}</strong></p>
          <p className="flex justify-between gap-3 sm:block"><span className="text-sm text-white/65">Còn lại</span><strong className="sm:block sm:text-lg">{formatVnd(Math.max(0, totalPrice - totalDeposit))}</strong></p>
        </footer>
      </section>
      <p className="mt-3 text-xs text-on-surface-variant">Bản báo giá chỉ dùng để tham khảo và không làm thay đổi giá sản phẩm trong hệ thống.</p>
    </main>
  );
}
