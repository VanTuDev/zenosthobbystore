"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import type { ApiCategory } from "@/lib/api-types";

function CategoryThumb({ category }: { category: ApiCategory }) {
  if (!category.image) {
    return (
      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
        <Icon name="image" className="!text-[20px]" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden relative shrink-0">
      <Image src={category.image} alt="" fill sizes="48px" className="object-cover" />
    </div>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onAddChild,
  onDelete,
  deletingId,
}: {
  categories: ApiCategory[];
  onEdit: (category: ApiCategory) => void;
  onAddChild: (parent: ApiCategory) => void;
  onDelete: (category: ApiCategory) => void;
  deletingId: string | null;
}) {
  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  // Track collapsed rows rather than expanded ones so every row — including a
  // parent that only just gained its first child — defaults to open.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (topLevel.length === 0) {
    return (
      <div className="flex flex-col items-center gap-xs py-2xl text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10">
        <Icon name="category" className="!text-[32px] text-on-surface-variant" />
        <p className="font-label-md text-label-md text-on-surface-variant">
          Chưa có danh mục nào. Bấm &quot;Thêm danh mục mới&quot; để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {topLevel.map((category) => {
        const children = childrenOf(category.id);
        const hasChildren = children.length > 0;
        const isExpanded = !collapsed.has(category.id);

        return (
          <div key={category.id} className="space-y-sm">
            <div className="group bg-surface-container-lowest rounded-lg border border-transparent hover:border-outline-variant hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition-all overflow-hidden">
              <div className="flex items-center p-md gap-md">
                <button
                  type="button"
                  onClick={() => (hasChildren ? toggle(category.id) : undefined)}
                  disabled={!hasChildren}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                  className="p-xs text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-0"
                >
                  <Icon name={isExpanded ? "expand_less" : "expand_more"} />
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  className="flex items-center gap-md flex-1 min-w-0 text-left"
                >
                  <CategoryThumb category={category} />
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{category.name}</h3>
                    <p className="text-on-surface-variant text-label-sm truncate">
                      {category.productCount} sản phẩm
                      {hasChildren && ` • ${children.length} thư mục con`}
                      {category.description && ` • ${category.description}`}
                    </p>
                  </div>
                  {category.status === "hidden" && (
                    <Badge tone="outline" className="shrink-0">
                      Đã ẩn
                    </Badge>
                  )}
                </button>

                <div className="flex items-center gap-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => onAddChild(category)}
                    className="p-xs text-on-surface-variant hover:text-primary transition-colors"
                    title="Thêm thư mục con"
                  >
                    <Icon name="create_new_folder" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="p-xs text-on-surface-variant hover:text-primary transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    disabled={deletingId === category.id}
                    className="p-xs text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                    title="Xóa"
                  >
                    <Icon
                      name={deletingId === category.id ? "progress_activity" : "delete"}
                      className={deletingId === category.id ? "animate-spin" : undefined}
                    />
                  </button>
                </div>
              </div>
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-16 space-y-sm relative">
                <div className="absolute left-[-24px] top-[-24px] bottom-1/2 w-6 border-l-2 border-b-2 border-outline-variant rounded-bl-xl" />
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="group bg-surface-container rounded-lg p-sm flex items-center gap-md border border-transparent hover:border-outline-variant transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => onEdit(child)}
                      className="flex items-center gap-sm flex-1 min-w-0 text-left"
                    >
                      <CategoryThumb category={child} />
                      <div className="min-w-0">
                        <h4 className="font-label-md text-on-surface truncate">{child.name}</h4>
                        <p className="text-label-sm text-on-surface-variant truncate">
                          {child.productCount} sản phẩm
                          {child.description && ` • ${child.description}`}
                        </p>
                      </div>
                      {child.status === "hidden" && (
                        <Badge tone="outline" className="shrink-0">
                          Đã ẩn
                        </Badge>
                      )}
                    </button>
                    <div className="flex items-center gap-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => onEdit(child)}
                        className="p-xs text-on-surface-variant hover:text-primary"
                        title="Chỉnh sửa"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(child)}
                        disabled={deletingId === child.id}
                        className="p-xs text-on-surface-variant hover:text-error disabled:opacity-40"
                        title="Xóa"
                      >
                        <Icon
                          name={deletingId === child.id ? "progress_activity" : "delete"}
                          className={deletingId === child.id ? "animate-spin" : undefined}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
