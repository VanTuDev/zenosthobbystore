"use client";

import { useEffect, useState } from "react";
import { CategoryTree } from "./category-tree";
import { CategoryFormModal } from "./category-form-modal";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { fetchCategories, deleteCategory } from "@/lib/api/categories";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

type ModalState =
  | { mode: "create"; parent?: ApiCategory }
  | { mode: "edit"; category: ApiCategory }
  | null;

export function CategoriesManager() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((res) => {
        if (cancelled) return;
        setCategories(res);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh mục.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topLevelCategories = categories.filter((c) => !c.parentId);
  const topLevelCount = topLevelCategories.length;
  const childCount = categories.length - topLevelCount;

  function handleSaved(saved: ApiCategory) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
    });
    setModalState(null);
  }

  async function handleDelete(category: ApiCategory) {
    const confirmed = await confirm({
      title: `Xóa "${category.name}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      tone: "danger",
    });
    if (!confirmed) return;
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showToast(`Đã xóa "${category.name}".`, "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Xóa thất bại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleDeletedFromModal(deleted: ApiCategory) {
    setCategories((prev) => prev.filter((c) => c.id !== deleted.id));
    setModalState(null);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-md gap-md flex-wrap">
        <p className="text-on-surface-variant font-body-md">
          {isLoading
            ? "Đang tải danh mục…"
            : `${topLevelCount} danh mục, ${childCount} thư mục con.`}
        </p>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="flex items-center gap-xs bg-primary text-on-primary px-md py-base rounded-lg font-label-md hover:brightness-110 transition-all"
        >
          Thêm danh mục mới
        </button>
      </div>

      {loadError && (
        <p className="flex items-center gap-xs text-error text-label-md mb-md p-sm bg-error-container/20 rounded-lg">
          <Icon name="error" />
          {loadError}
        </p>
      )}

      {!isLoading && (
        <CategoryTree
          categories={categories}
          onEdit={(category) => setModalState({ mode: "edit", category })}
          onAddChild={(parent) => setModalState({ mode: "create", parent })}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      {modalState && (
        <CategoryFormModal
          category={modalState.mode === "edit" ? modalState.category : undefined}
          parent={modalState.mode === "create" ? modalState.parent : undefined}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
          onDeleted={handleDeletedFromModal}
        />
      )}
    </div>
  );
}
