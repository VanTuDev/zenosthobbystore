"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/store/empty-state";
import { Icon } from "@/components/ui/icon";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Reveal } from "@/components/ui/reveal";
import { fetchProducts, type ProductListParams } from "@/lib/api/products";
import { mapApiProduct } from "@/lib/api/map-product";
import type { ApiCategory, ProductFacets } from "@/lib/api-types";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "moi-nhap", label: "Mới nhập về" },
  { value: "gia-thap-cao", label: "Giá: Thấp đến Cao" },
  { value: "gia-cao-thap", label: "Giá: Cao đến Thấp" },
  { value: "pho-bien", label: "Phổ biến nhất" },
] as const;

type Props = {
  categories: ApiCategory[];
  facets: ProductFacets;
};

/**
 * Belt-and-suspenders against duplicate React keys: skip/limit pagination can overlap a row
 * across two page fetches (e.g. rows created in the same millisecond racing on sort order),
 * which would otherwise render the same product twice.
 */
function dedupeById(items: Product[]): Product[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// No "Áp dụng bộ lọc" button — checkbox/radio/select filters apply immediately on change;
// free-text price inputs apply on blur or Enter instead of re-submitting per keystroke.
function submitOnChange(e: { currentTarget: HTMLInputElement | HTMLSelectElement }) {
  e.currentTarget.form?.requestSubmit();
}

function submitOnBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.form?.requestSubmit();
}

function submitOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  e.currentTarget.form?.requestSubmit();
}

/**
 * Radios can't be unchecked by clicking them again, and a same-named submit button doesn't
 * override a checked radio's value in the serialized form data (both entries are sent, and
 * `URLSearchParams.get` returns the radio's). Clear it in JS instead, then submit for real.
 */
function clearScale(e: React.MouseEvent<HTMLButtonElement>) {
  const form = e.currentTarget.form;
  if (!form) return;
  form.querySelectorAll<HTMLInputElement>('input[name="scale"]').forEach((radio) => {
    radio.checked = false;
  });
  form.requestSubmit();
}

export function ProductCatalogClient({ categories, facets }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? undefined;
  const selectedCategorySlugs = searchParams.getAll("category");
  const selectedBrands = searchParams.getAll("brand");
  const selectedScale = searchParams.get("scale") ?? undefined;
  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const sort = searchParams.get("sort") ?? (status === "pre_order" ? "moi-nhap" : "pho-bien");
  const badge = searchParams.get("badge") ?? undefined;

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const categoryIdBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c.id])), [categories]);
  const selectedCategoryIds = selectedCategorySlugs
    .map((slug) => categoryIdBySlug.get(slug))
    .filter((id): id is string => Boolean(id));

  const hasActiveFilters =
    selectedCategorySlugs.length > 0 ||
    selectedBrands.length > 0 ||
    Boolean(selectedScale) ||
    min !== "" ||
    max !== "" ||
    Boolean(status) ||
    Boolean(badge);

  const requestParams: ProductListParams = {
    q,
    categoryIds: selectedCategoryIds,
    brands: selectedBrands,
    scale: selectedScale,
    minPrice: min !== "" ? Number(min) : undefined,
    maxPrice: max !== "" ? Number(max) : undefined,
    badge,
    stockStatus: status,
    sort,
  };
  // Deep-equality key: request params contain arrays that get new identities every
  // render, so effects key off this string instead of the object reference.
  const requestKey = JSON.stringify(requestParams);

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Guards against a slow "load more" fetch (started under the old filters)
  // landing after the user has already changed filters and reset the list.
  const activeRequestKey = useRef(requestKey);

  useEffect(() => {
    activeRequestKey.current = requestKey;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    fetchProducts({ ...requestParams, page: 1, pageSize: PAGE_SIZE }).then((res) => {
      if (cancelled) return;
      setProducts(dedupeById(res.items.map((p) => mapApiProduct(p, categoryNameById))));
      setPage(1);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, categoryNameById]);

  // A plain ref guard (checked synchronously, before any state update is even queued) instead of
  // relying on the isLoadingMore state round-trip — the IntersectionObserver below gets torn down
  // and recreated on every page change, and re-observing an element already in view fires its
  // callback again right away, so loadMore() can be re-entered before a state update has committed.
  const isFetchingMoreRef = useRef(false);

  const loadMore = useCallback(() => {
    if (isFetchingMoreRef.current || page >= totalPages) return;
    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);

    const requestKeyAtCallTime = activeRequestKey.current;
    const nextPage = page + 1;
    fetchProducts({ ...requestParams, page: nextPage, pageSize: PAGE_SIZE }).then((res) => {
      isFetchingMoreRef.current = false;
      // Filters changed (and the page-1 reset already ran) while this was in flight — drop it.
      if (activeRequestKey.current !== requestKeyAtCallTime) return;
      setProducts((prev) => {
        const seenIds = new Set(prev.map((p) => p.id));
        const fresh = res.items
          .map((p) => mapApiProduct(p, categoryNameById))
          .filter((p) => !seenIds.has(p.id));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
      setIsLoadingMore(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, requestKey, categoryNameById]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const brands = facets.brands;
  const scales = facets.scales;
  const hasMore = page < totalPages;
  const categoriesDefaultOpen = selectedCategorySlugs.length > 0 || categories.length <= 8;
  const brandsDefaultOpen = selectedBrands.length > 0 || brands.length <= 8;

  // Filters previously submitted as a real GET form — a full browser navigation that reloaded
  // the whole page (header, footer, everything) just to re-run the filters. Intercepting submit
  // and pushing the same URL through the router keeps this entirely client-side: only this
  // component's data refetches, the page never unmounts.
  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value !== "") params.append(key, value);
    }
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="pt-28 pb-xl max-w-[1800px] mx-auto px-margin-mobile md:px-margin-desktop">
      <form onSubmit={handleFilterSubmit}>
        {q && <input type="hidden" name="q" value={q} />}

        <div className="flex items-center justify-between mb-md">
          <h2 className="font-label-md text-label-md uppercase tracking-widest text-outline">Bộ lọc</h2>
          {(hasActiveFilters || q) && (
            <Link href="/products" className="text-label-sm text-primary hover:underline">
              Xóa tất cả
            </Link>
          )}
        </div>

        {/* Filters flank the product grid on desktop — both sidebars are sticky so they stay
            reachable while scrolling a long result grid. No "apply" button: every control
            auto-submits the form on change, since checkbox/radio state alone doesn't affect
            the URL until the GET form is submitted. */}
        <div className="flex flex-col lg:flex-row gap-lg lg:gap-xl items-start">
          {/* Left sidebar: Category + Price */}
          <aside
            aria-label="Lọc theo danh mục và giá"
            className="w-full lg:w-64 flex-shrink-0 space-y-md lg:sticky lg:top-28 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin"
          >
            {/* Category */}
            <details open={categoriesDefaultOpen} className="group">
              <summary className="flex items-center justify-between font-label-md text-label-md uppercase tracking-widest text-outline mb-sm list-none [&::-webkit-details-marker]:hidden">
                <span>
                  Danh mục{selectedCategorySlugs.length > 0 ? ` (${selectedCategorySlugs.length})` : ""}
                </span>
                <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-sm max-h-112 overflow-y-auto pr-2 scrollbar-thin">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-sm cursor-pointer group/item">
                    <input
                      type="checkbox"
                      name="category"
                      value={category.slug}
                      defaultChecked={selectedCategorySlugs.includes(category.slug)}
                      onChange={submitOnChange}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-body-md group-hover/item:text-primary transition-colors">
                      {category.name} ({category.productCount})
                    </span>
                  </label>
                ))}
              </div>
            </details>

            <div className="h-[1px] bg-outline-variant/30" />

            {/* Price Range */}
            <div>
              <h2 className="font-label-md text-label-md uppercase tracking-widest text-outline mb-sm">
                Khoảng giá
              </h2>
              <div className="flex items-center gap-sm">
                <label htmlFor="price-min" className="sr-only">
                  Giá tối thiểu
                </label>
                <input
                  id="price-min"
                  name="min"
                  defaultValue={min}
                  onBlur={submitOnBlur}
                  onKeyDown={submitOnEnter}
                  className="w-full bg-surface-container-low border-none rounded-lg px-sm py-xs text-body-md"
                  placeholder="Tối thiểu"
                  type="number"
                  inputMode="numeric"
                />
                <span className="text-outline">—</span>
                <label htmlFor="price-max" className="sr-only">
                  Giá tối đa
                </label>
                <input
                  id="price-max"
                  name="max"
                  defaultValue={max}
                  onBlur={submitOnBlur}
                  onKeyDown={submitOnEnter}
                  className="w-full bg-surface-container-low border-none rounded-lg px-sm py-xs text-body-md"
                  placeholder="Tối đa"
                  type="number"
                  inputMode="numeric"
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section aria-label="Danh sách sản phẩm" className="flex-grow min-w-0 w-full order-last lg:order-none">
            {/* Toolbar: result count + sort, replaces the old page heading to keep this compact */}
            <div className="flex items-center justify-between gap-sm mb-md">
              <p className="text-label-sm text-on-surface-variant">
                {isLoading ? "Đang tải…" : q ? `${total} kết quả cho "${q}"` : `${total} sản phẩm`}
              </p>
              <div className="flex items-center gap-xs shrink-0">
                <label htmlFor="sort-by" className="text-label-sm text-outline">
                  Sắp xếp:
                </label>
                <select
                  id="sort-by"
                  name="sort"
                  defaultValue={sort}
                  onChange={submitOnChange}
                  className="bg-surface-container-low border-none rounded-lg px-sm py-xs text-label-sm font-bold focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              {isLoading && <LoadingOverlay />}

              {!isLoading && products.length === 0 ? (
                <EmptyState
                  icon="search_off"
                  title="Không tìm thấy sản phẩm nào"
                  description="Thử điều chỉnh bộ lọc hoặc từ khóa khác, hoặc xem toàn bộ bộ sưu tập của chúng tôi."
                />
              ) : (
                <div
                  className={`transition-opacity duration-200 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
                >
                  <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
                    {products.map((product, i) => (
                      <li key={product.id}>
                        <Reveal delay={(i % PAGE_SIZE) * 40} from="up">
                          <ProductCard product={product} />
                        </Reveal>
                      </li>
                    ))}
                  </ul>

                  {/* Infinite-scroll sentinel: fetches the next backend page once it enters the viewport. */}
                  {hasMore && (
                    <div ref={sentinelRef} className="flex items-center justify-center gap-sm py-lg text-on-surface-variant">
                      {isLoadingMore && (
                        <>
                          <Icon name="progress_activity" className="animate-spin" />
                          <span className="font-label-md text-label-md">Đang tải thêm sản phẩm…</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Right sidebar: Brand + Scale */}
          <aside
            aria-label="Lọc theo thương hiệu và tỷ lệ"
            className="w-full lg:w-64 flex-shrink-0 space-y-md lg:sticky lg:top-28 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pl-1 scrollbar-thin"
          >
            {/* Brand */}
            <details open={brandsDefaultOpen} className="group">
              <summary className="flex items-center justify-between font-label-md text-label-md uppercase tracking-widest text-outline mb-sm list-none [&::-webkit-details-marker]:hidden">
                <span>Thương hiệu{selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ""}</span>
                <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-sm max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                {brands.map((brand) => (
                  <label key={brand.value} className="flex items-center gap-sm cursor-pointer group/item">
                    <input
                      type="checkbox"
                      name="brand"
                      value={brand.value}
                      defaultChecked={selectedBrands.includes(brand.value)}
                      onChange={submitOnChange}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-body-md group-hover/item:text-primary transition-colors">
                      {brand.value} ({brand.count})
                    </span>
                  </label>
                ))}
              </div>
            </details>

            <div className="h-[1px] bg-outline-variant/30" />

            {/* Scale */}
            <div>
              <h2 className="font-label-md text-label-md uppercase tracking-widest text-outline mb-sm">
                Tỷ lệ
              </h2>
              <div className="flex flex-wrap gap-xs">
                {scales.map((scale) => {
                  const checked = selectedScale === scale.value;
                  return (
                    <label key={scale.value}>
                      <input
                        type="radio"
                        name="scale"
                        value={scale.value}
                        defaultChecked={checked}
                        onChange={submitOnChange}
                        className="peer sr-only"
                      />
                      <span className="inline-block px-sm py-xs rounded border text-label-sm transition-colors cursor-pointer peer-checked:bg-primary-fixed peer-checked:border-primary peer-checked:text-primary peer-checked:font-bold bg-surface-container border-outline-variant hover:border-primary">
                        {scale.value} ({scale.count})
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedScale && (
                <button
                  type="button"
                  onClick={clearScale}
                  className="mt-xs text-label-sm text-primary hover:underline"
                >
                  Bỏ chọn tỷ lệ
                </button>
              )}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
