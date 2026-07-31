"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldLabel, textFieldClass } from "@/components/ui/form-field";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { SingleImageUpload, type DraftSingleImage } from "@/components/admin/single-image-upload";
import { createCategory, updateCategory, deleteCategory } from "@/lib/api/categories";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

const STATUS_OPTIONS: { value: ApiCategory["status"]; label: string; icon: string }[] = [
  { value: "active", label: "Công khai", icon: "visibility" },
  { value: "hidden", label: "Đã ẩn", icon: "visibility_off" },
];

export function CategoryFormModal({
  category,
  parent,
  onClose,
  onSaved,
  onDeleted,
}: {
  /** Present → edit that category; absent → create a new one. */
  category?: ApiCategory;
  /** When creating a child ("thư mục"), the category it will nest under. */
  parent?: ApiCategory;
  onClose: () => void;
  onSaved: (category: ApiCategory) => void;
  onDeleted: (category: ApiCategory) => void;
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEdit = Boolean(category);
  const isChild = isEdit ? Boolean(category?.parentId) : Boolean(parent);
  const noun = isChild ? "thư mục" : "danh mục";

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [status, setStatus] = useState<ApiCategory["status"]>(category?.status ?? "active");
  const [image, setImage] = useState<DraftSingleImage | null>(
    category?.image ? { url: category.image, status: "done" } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isUploadingImage = image?.status === "uploading";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Vui lòng nhập tên.");
    if (name.trim().length > 100) return setError("Tên không được vượt quá 100 ký tự.");
    if (description.trim().length > 500) return setError("Mô tả không được vượt quá 500 ký tự.");
    if (isUploadingImage) return setError("Vui lòng đợi ảnh tải lên xong.");

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        status,
        image: image?.status === "done" ? image.url : "",
        parentId: isEdit ? category!.parentId : (parent?.id ?? null),
      };

      const { category: saved } = category
        ? await updateCategory(category.id, payload)
        : await createCategory(payload);

      showToast(isEdit ? `Đã cập nhật "${saved.name}".` : `Đã tạo "${saved.name}".`, "success");
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!category) return;
    const confirmed = await confirm({
      title: `Xóa "${category.name}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      tone: "danger",
    });
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      showToast(`Đã xóa "${category.name}".`, "success");
      onDeleted(category);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Xóa thất bại, vui lòng thử lại.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const title = isEdit ? `Chỉnh sửa ${noun}` : isChild ? "Thêm thư mục con" : "Thêm danh mục";

  return (
    <Modal
      onClose={onClose}
      closeDisabled={saving || deleting}
      labelledBy="category-form-modal-title"
      icon={isChild ? "folder" : "category"}
      title={title}
      subtitle={
        !isEdit && parent ? (
          <>
            Thuộc: <span className="font-medium text-on-surface">{parent.name}</span>
          </>
        ) : undefined
      }
      headerActions={
        isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            title={`Xóa ${noun}`}
            className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors disabled:opacity-50"
          >
            <Icon
              name={deleting ? "progress_activity" : "delete"}
              className={`!text-[20px] ${deleting ? "animate-spin" : ""}`}
            />
          </button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <div>
            <FieldLabel>Hình ảnh {noun}</FieldLabel>
            <div className="mt-1">
              <SingleImageUpload image={image} onChange={setImage} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="cat-name" required counter={`${name.length}/100`}>
              Tên {noun}
            </FieldLabel>
            <input
              id="cat-name"
              type="text"
              autoFocus
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isChild ? "Vd: Master Grade..." : "Vd: Gundam, Figure..."}
              className={textFieldClass}
            />
          </div>

          <div>
            <FieldLabel>Trạng thái hiển thị</FieldLabel>
            <SegmentedToggle options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>

          <div>
            <FieldLabel htmlFor="cat-description" counter={`${description.length}/500`}>
              Mô tả
            </FieldLabel>
            <textarea
              id="cat-description"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả ngắn cho danh mục này..."
              className={`${textFieldClass} resize-none`}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error font-label-md text-xs">
              <Icon name="error" className="shrink-0 !text-[16px] mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-outline-variant/30 px-4 sm:px-6 py-3 bg-surface-container-lowest flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="px-4 py-2 font-label-md text-xs sm:text-sm text-on-surface-variant hover:bg-surface-container border border-outline-variant/60 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <Button
            type="submit"
            disabled={saving || deleting || isUploadingImage}
            className="px-5 py-2 text-xs sm:text-sm font-medium rounded-xl shadow-xs"
          >
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
