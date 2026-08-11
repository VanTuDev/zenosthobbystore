"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatVnd } from "@/lib/format";
import type { ApiProduct } from "@/lib/api-types";
import type { StockStatus } from "@/lib/types";

const STOCK_META: Record<StockStatus, { label: string; tone: "primary" | "tertiary" | "muted" | "outline" }> = {
  in_stock: { label: "Còn hàng", tone: "primary" },
  pre_order: { label: "Đặt trước", tone: "outline" },
  coming_soon: { label: "Sắp mở bán", tone: "outline" },
  sold_out: { label: "Hết hàng", tone: "tertiary" },
};

export function AdminProductsTable({
  products,
  categoryNameById,
  onEdit,
  onDelete,
  deletingId,
}: {
  products: ApiProduct[];
  categoryNameById: ReadonlyMap<string, string>;
  onEdit: (product: ApiProduct) => void;
  onDelete: (product: ApiProduct) => void;
  deletingId: string | null;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Giá bán
              </th>
              <th className="px-md py-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Kho
              </th>
              <th className="px-md py-md" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {products.map((product) => {
              const stock = STOCK_META[product.stockStatus];
              const categoryName = product.categoryId ? (categoryNameById.get(product.categoryId) ?? "—") : "—";
              return (
                <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 bg-white border border-outline-variant/30">
                        <Image
                          src={product.heroImage || "/placeholder-product.svg"}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate max-w-[220px]">{product.name}</p>
                        <p className="text-label-sm text-on-surface-variant truncate max-w-[220px]">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-md text-on-surface font-label-md">{categoryName}</td>
                  <td className="px-md py-md font-bold text-on-surface">{formatVnd(product.price)}</td>
                  <td className="px-md py-md">
                    <Badge tone={stock.tone}>{stock.label}</Badge>
                  </td>
                  <td className="px-md py-md text-right">
                    <div className="flex items-center justify-end gap-xs">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        prefetch={false}
                        className="p-xs hover:bg-outline-variant/20 rounded-full transition-colors inline-flex"
                        title="Xem trên cửa hàng"
                        aria-label={`Xem ${product.name} trên cửa hàng`}
                      >
                        <Icon name="open_in_new" className="text-on-surface-variant" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Chỉnh sửa sản phẩm"
                        aria-label={`Chỉnh sửa ${product.name}`}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        disabled={deletingId === product.id}
                        className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors disabled:opacity-40"
                        title="Xóa sản phẩm"
                        aria-label={`Xóa ${product.name}`}
                      >
                        <Icon name={deletingId === product.id ? "progress_activity" : "delete"} className={deletingId === product.id ? "animate-spin" : undefined} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-md bg-surface border-t border-outline-variant/20">
        <p className="text-label-sm text-on-surface-variant">Hiển thị {products.length} sản phẩm.</p>
      </div>
    </div>
  );
}
