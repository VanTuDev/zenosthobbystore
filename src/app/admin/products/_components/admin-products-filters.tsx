"use client";

import { Icon } from "@/components/ui/icon";
import type { ApiCategory } from "@/lib/api-types";

export type ProductFilters = {
  q: string;
  categoryId: string;
  stockStatus: string;
  sort: string;
};

const STOCK_FILTER_OPTIONS = [
  { value: "", label: "Tất cả tình trạng" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "pre_order", label: "Đặt trước" },
  { value: "coming_soon", label: "Sắp mở bán" },
  { value: "sold_out", label: "Hết hàng" },
];

const SORT_OPTIONS = [
  { value: "moi-nhap", label: "Mới nhập trước" },
  { value: "gia-thap-cao", label: "Giá: thấp đến cao" },
  { value: "gia-cao-thap", label: "Giá: cao đến thấp" },
  { value: "pho-bien", label: "Phổ biến nhất" },
];

const selectClass =
  "bg-white border-none rounded-lg pl-9 pr-8 py-2 font-label-md text-label-md text-on-surface ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer";

export function AdminProductsFilters({
  filters,
  onChange,
  categories,
  resultCount,
}: {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  categories: ApiCategory[];
  resultCount?: number;
}) {
  const hasActiveFilters = Boolean(filters.q || filters.categoryId || filters.stockStatus);

  return (
    <div className="flex flex-col gap-sm mb-md">
      <div className="flex flex-wrap items-center gap-sm">
        <div className="relative flex-1 min-w-[220px] max-w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name="search" className="!text-[18px]" />
          </span>
          <label htmlFor="product-search" className="sr-only">
            Tìm kiếm sản phẩm theo tên hoặc thương hiệu
          </label>
          <input
            id="product-search"
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Tìm theo tên, thương hiệu..."
            className="w-full bg-white border-none rounded-lg pl-9 pr-3 py-2 font-body-md text-body-md ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name="category" className="!text-[16px]" />
          </span>
          <label htmlFor="product-filter-category" className="sr-only">
            Lọc theo danh mục
          </label>
          <select
            id="product-filter-category"
            value={filters.categoryId}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
            className={selectClass}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name="inventory_2" className="!text-[16px]" />
          </span>
          <label htmlFor="product-filter-stock" className="sr-only">
            Lọc theo tình trạng kho
          </label>
          <select
            id="product-filter-stock"
            value={filters.stockStatus}
            onChange={(e) => onChange({ ...filters, stockStatus: e.target.value })}
            className={selectClass}
          >
            {STOCK_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <Icon name="sort" className="!text-[16px]" />
          </span>
          <label htmlFor="product-sort" className="sr-only">
            Sắp xếp sản phẩm
          </label>
          <select
            id="product-sort"
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className={selectClass}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ q: "", categoryId: "", stockStatus: "", sort: filters.sort })}
            className="inline-flex items-center gap-1 px-sm py-2 font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors"
          >
            <Icon name="filter_alt_off" className="!text-[16px]" />
            Xóa lọc
          </button>
        )}

        {resultCount !== undefined && (
          <span className="ml-auto font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
            {resultCount} kết quả
          </span>
        )}
      </div>
    </div>
  );
}
