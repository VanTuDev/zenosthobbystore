"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ApiCategory } from "@/lib/api-types";

/**
 * Assigns a single existing category (or child "thư mục") to a product.
 * Mirrors the tree shown on /admin/categories: top-level categories, each
 * optionally expanded with the child categories ("thư mục") nested under it.
 */
export function CategoryPicker({
  categories,
  selectedCategoryId,
  onChange,
}: {
  categories: ApiCategory[];
  selectedCategoryId: string | null;
  onChange: (categoryId: string | null) => void;
}) {
  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const select = (categoryId: string) => {
    onChange(selectedCategoryId === categoryId ? null : categoryId);
  };

  return (
    <div className="max-h-48 overflow-y-auto space-y-sm pr-xs">
      {topLevel.map((category) => {
        const children = childrenOf(category.id);
        return (
          <div key={category.id} className="space-y-1">
            <button
              type="button"
              onClick={() => select(category.id)}
              aria-pressed={selectedCategoryId === category.id}
              className={`px-xs py-0.5 rounded-full text-[11px] border transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white text-on-surface border-outline-variant hover:border-primary font-bold"
              }`}
            >
              {category.name}
            </button>
            {children.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-md">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => select(child.id)}
                    aria-pressed={selectedCategoryId === child.id}
                    className={`px-xs py-0.5 rounded-full text-[11px] border transition-colors ${
                      selectedCategoryId === child.id
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-white text-on-surface border-outline-variant hover:border-primary"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <Link
        href="/admin/categories"
        target="_blank"
        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-xs"
      >
        <Icon name="add" className="!text-[14px]" />
        Quản lý danh mục
      </Link>
    </div>
  );
}
