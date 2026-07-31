"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductsTable } from "./admin-products-table";
import { AdminProductsFilters, type ProductFilters } from "./admin-products-filters";
import { ProductFormModal } from "./product-form-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { fetchProducts, deleteProduct } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

const PAGE_SIZE = 50;
const DEFAULT_FILTERS: ProductFilters = { q: "", categoryId: "", stockStatus: "", sort: "moi-nhap" };

export function AdminProductsSection() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{ mode: "create" } | { mode: "edit"; product: ApiProduct } | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the loading state for the fetch this same effect issues
    setIsLoading(true);
    const handle = setTimeout(() => {
      fetchProducts({
        page: 1,
        pageSize: PAGE_SIZE,
        q: filters.q || undefined,
        categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
        stockStatus: filters.stockStatus || undefined,
        sort: filters.sort || undefined,
      })
        .then((productsRes) => {
          if (cancelled) return;
          setProducts(productsRes.items);
          setPage(1);
          setTotalPages(productsRes.pagination.totalPages);
          setTotal(productsRes.pagination.total);
          setLoadError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách sản phẩm.");
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, filters.q ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [filters]);

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  async function loadMore() {
    if (isLoadingMore || page >= totalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchProducts({
        page: nextPage,
        pageSize: PAGE_SIZE,
        q: filters.q || undefined,
        categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
        stockStatus: filters.stockStatus || undefined,
        sort: filters.sort || undefined,
      });
      setProducts((prev) => [...prev, ...res.items]);
      setPage(nextPage);
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải thêm sản phẩm.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleSaved(saved: ApiProduct) {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setModalState(null);
  }

  async function handleDelete(product: ApiProduct) {
    const confirmed = await confirm({
      title: `Xóa sản phẩm "${product.name}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      tone: "danger",
    });
    if (!confirmed) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Đã xóa "${product.name}".`, "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Xóa sản phẩm thất bại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Sản phẩm"
        description={isLoading ? "Đang tải sản phẩm…" : `Đang quản lý ${total} sản phẩm trong catalog Zenos Hobby.`}
        action={
          <Button onClick={() => setModalState({ mode: "create" })}>
            <Icon name="add_photo_alternate" className="!text-[18px]" />
            Thêm sản phẩm mới
          </Button>
        }
      />

      <AdminProductsFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        resultCount={isLoading ? undefined : total}
      />

      {loadError && (
        <p className="flex items-center gap-xs text-error text-label-md mb-md p-sm bg-error-container/20 rounded-lg">
          <Icon name="error" />
          {loadError}
        </p>
      )}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center gap-xs py-2xl text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
          <Icon name="inventory_2" className="!text-[32px] text-on-surface-variant" />
          <p className="font-label-md text-label-md text-on-surface-variant">
            {filters.q || filters.categoryId || filters.stockStatus
              ? "Không tìm thấy sản phẩm phù hợp với bộ lọc."
              : "Chưa có sản phẩm nào. Bấm “Thêm sản phẩm mới” để bắt đầu."}
          </p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <AdminProductsTable
          products={products}
          categoryNameById={categoryNameById}
          onEdit={(product) => setModalState({ mode: "edit", product })}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {!isLoading && page < totalPages && (
        <div className="flex justify-center mt-md">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-lg py-sm rounded-lg border-2 border-outline-variant font-label-md text-label-md hover:border-on-surface transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? "Đang tải..." : "Tải thêm sản phẩm"}
          </button>
        </div>
      )}

      {modalState && (
        <ProductFormModal
          product={modalState.mode === "edit" ? modalState.product : undefined}
          categories={categories}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
