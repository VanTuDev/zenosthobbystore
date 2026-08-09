"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { PriceInput } from "./price-input";
import { uploadProductImage } from "@/lib/api/uploads";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiProductVariant } from "@/lib/api-types";

const MAX_VARIANTS = 100;

/** A blank/new row keeps its price as a plain string so PriceInput's thousands-formatting works before the number is parsed on save. */
export type DraftVariant = { name: string; price: string; stockCount: string; image: string };

export function draftFromVariant(variant: ApiProductVariant): DraftVariant {
  return { name: variant.name, price: String(variant.price), stockCount: String(variant.stockCount), image: variant.image };
}

function VariantImagePicker({ image, onChange }: { image: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    uploadProductImage(file)
      .then(({ url }) => onChange(url))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Tải ảnh thất bại."))
      .finally(() => setUploading(false));
  }

  return (
    <div className="relative w-9 h-9 shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={image ? "Đổi ảnh biến thể" : "Thêm ảnh biến thể"}
        title={error ?? undefined}
        className={`group relative w-9 h-9 rounded-lg overflow-hidden border transition-colors ${
          error ? "border-error" : "border-outline-variant/50 hover:border-primary/60"
        } ${image ? "bg-white" : "bg-surface-container-low"}`}
      >
        {image ? (
          <>
            <Image src={image} alt="" fill unoptimized sizes="36px" className="object-cover" />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Icon name="edit" className="!text-[13px] text-white" />
            </span>
          </>
        ) : (
          <span className="w-full h-full flex items-center justify-center text-on-surface-variant">
            <Icon name="add_photo_alternate" className="!text-[15px]" />
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Icon name="progress_activity" className="!text-[14px] text-primary animate-spin" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function VariantsEditor({
  variants,
  onChange,
}: {
  variants: DraftVariant[];
  onChange: (variants: DraftVariant[]) => void;
}) {
  const atLimit = variants.length >= MAX_VARIANTS;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const update = (index: number, patch: Partial<DraftVariant>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const remove = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const move = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...variants];
    const [movedVariant] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedVariant);
    onChange(reordered);
  };

  const finishDragging = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const add = () => {
    if (atLimit) return;
    onChange([...variants, { name: "", price: "", stockCount: "", image: "" }]);
  };

  return (
    <div className="space-y-xs">
      {variants.length > 0 && (
        <div className="space-y-1.5">
          <div className="hidden sm:grid grid-cols-[28px_36px_1fr_140px_100px_28px] gap-1.5 px-0.5">
            <span className="font-body-sm text-[11px] text-on-surface-variant text-center">Vị trí</span>
            <span />
            <span className="font-body-sm text-[11px] text-on-surface-variant">Tên biến thể</span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Giá</span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Tồn kho</span>
            <span />
          </div>
          {variants.map((variant, index) => (
            <div
              key={index}
              onDragOver={(event) => {
                if (draggedIndex === null) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedIndex !== null) move(draggedIndex, index);
                finishDragging();
              }}
              className={`grid grid-cols-[28px_36px_1fr_28px] sm:grid-cols-[28px_36px_1fr_140px_100px_28px] gap-1.5 items-center rounded-lg transition-all ${
                dragOverIndex === index && draggedIndex !== index
                  ? "ring-2 ring-primary/50 bg-primary/5"
                  : ""
              } ${draggedIndex === index ? "opacity-50" : ""}`}
            >
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  setDraggedIndex(index);
                  setDragOverIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onDragEnd={finishDragging}
                aria-label={`Kéo để đổi vị trí biến thể ${variant.name || index + 1}`}
                title="Giữ chuột và kéo để đổi vị trí"
                className="flex h-9 w-7 cursor-grab active:cursor-grabbing items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="drag_indicator" className="!text-[20px]" />
              </button>
              <VariantImagePicker image={variant.image} onChange={(url) => update(index, { image: url })} />
              <input
                type="text"
                value={variant.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="Vd: Đỏ - Size M"
                className="col-span-2 sm:col-span-1 w-full bg-white border-none rounded-lg px-sm py-1.5 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="col-span-2 sm:col-span-1">
                <PriceInput
                  id={`variant-price-${index}`}
                  value={variant.price}
                  onChange={(v) => update(index, { price: v })}
                  placeholder="Giá"
                />
              </div>
              <input
                type="number"
                min={0}
                value={variant.stockCount}
                onChange={(e) => update(index, { stockCount: e.target.value })}
                placeholder="0"
                className="w-full bg-white border-none rounded-lg px-sm py-1.5 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Xóa biến thể"
                className="justify-self-end sm:justify-self-center p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
              >
                <Icon name="close" className="!text-[16px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        disabled={atLimit}
        className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="add_circle" className="!text-[16px]" />
        Thêm biến thể ({variants.length}/{MAX_VARIANTS})
      </button>
    </div>
  );
}
