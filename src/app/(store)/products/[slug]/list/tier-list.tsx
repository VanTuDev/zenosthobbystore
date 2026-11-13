"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ApiProduct, ApiProductVariant } from "@/lib/api-types";

const colors = ["bg-rose-200", "bg-orange-200", "bg-amber-200", "bg-lime-200", "bg-emerald-200", "bg-sky-200", "bg-violet-200"];

export function TierList({ product }: { product: Pick<ApiProduct, "slug" | "name" | "brand" | "heroImage" | "variants" | "manufacturerReviews"> }) {
  const [hidden, setHidden] = useState<Set<number>>(() => new Set());
  const groups = new Map<string, { name: string; variants: (ApiProductVariant & { listIndex: number })[] }>();
  for (const [listIndex, variant] of (product.variants ?? []).entries()) {
    if (hidden.has(listIndex)) continue;
    const name = variant.manufacturer?.trim() || product.brand.trim() || "Chưa rõ xưởng";
    const key = name.toLocaleLowerCase("vi");
    const group = groups.get(key) ?? { name, variants: [] };
    group.variants.push({ ...variant, listIndex });
    groups.set(key, group);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-20 pt-28 md:px-10">
      <Link href={`/products/${encodeURIComponent(product.slug)}`} className="text-sm font-bold text-primary hover:underline">← Quay lại sản phẩm</Link>
      <div className="my-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Tier List</p>
        <h1 className="text-3xl font-bold text-on-surface md:text-4xl">{product.name}</h1>
        <p className="mt-3 text-on-surface-variant">{groups.size} xưởng sản xuất · {product.variants.length - hidden.size} biến thể</p>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <p className="text-on-surface-variant">?n bi?n th? ch? ?p d?ng trong l?n xem n?y, kh?ng thay ??i s?n ph?m.</p>
        {hidden.size > 0 && <button type="button" onClick={() => setHidden(new Set())} className="rounded-lg border border-primary/30 px-3 py-2 font-bold text-primary">Hi?n l?i t?t c? ({hidden.size})</button>}
      </div>
      {groups.size ? (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-white">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
            <caption className="sr-only">Các biến thể của {product.name} theo xưởng sản xuất và đánh giá</caption>
            <colgroup><col className="w-[140px] md:w-[180px]" /><col /><col className="w-[160px] md:w-[220px]" /></colgroup>
            <thead className="bg-surface-container-low text-sm"><tr><th scope="col" className="p-4">Xưởng SX</th><th scope="col" className="p-4">Sản phẩm / Biến thể</th><th scope="col" className="p-4">Đánh giá</th></tr></thead>
            <tbody>
              {[...groups].map(([key, group], index) => (
                <tr key={key} className="border-t border-outline-variant">
                  <th scope="row" className={`break-words p-4 text-center text-sm font-bold text-slate-900 ${colors[index % colors.length]}`}>{group.name}</th>
                  <td className="bg-[#202323] p-3">
                    <ul className="flex flex-wrap gap-3">
                      {group.variants.map((variant) => (
                        <li key={variant.listIndex} className="relative w-[76px] text-center">
                          <button type="button" aria-label={`?n bi?n th? ${variant.name} kh?i List`} title="?n t?m th?i kh?i List" onClick={() => setHidden((previous) => new Set([...previous, variant.listIndex]))} className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg text-slate-900 shadow hover:bg-rose-100">?</button>
                          <Image src={variant.image || product.heroImage || "/placeholder-product.svg"} alt={variant.name} width={76} height={76} unoptimized className="h-[76px] w-[76px] rounded-full border-2 border-white/20 bg-white object-cover" />
                          <p className="mt-1.5 break-words text-xs leading-snug text-white">{variant.name}</p>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-pre-wrap break-words p-4 align-middle text-sm text-on-surface-variant">{product.manufacturerReviews?.find((r) => r.manufacturer.trim().toLocaleLowerCase("vi") === key)?.review || "Chưa có đánh giá"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="rounded-xl bg-surface-container-low p-6 text-on-surface-variant">Sản phẩm chưa có biến thể để hiển thị.</p>}
      <p className="mt-4 text-xs text-on-surface-variant">Các xưởng hiển thị theo thứ tự biến thể; màu hàng dùng để phân biệt xưởng.</p>
    </main>
  );
}
