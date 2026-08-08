"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { ApiRequestError } from "@/lib/api-client";

export type DraftImage = {
  id: string;
  /** Local blob preview while uploading; the real Cloudinary URL once `status` is "done". */
  url: string;
  name: string;
  publicId?: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function ImageDropzone({
  images,
  onChange,
  uploadFn,
  deleteFn,
  maxImages,
  tileClassName = "w-20 h-20",
  helperLabel = "ảnh",
}: {
  images: DraftImage[];
  onChange: (images: DraftImage[]) => void;
  /** Uploads one file, resolving to its stored URL + Cloudinary public ID. */
  uploadFn: (file: File) => Promise<{ url: string; publicId: string }>;
  /** Optional — when omitted, removing an image just drops it locally (no server-side cleanup). */
  deleteFn?: (publicId: string) => Promise<void>;
  /** Omit for unlimited images. */
  maxImages?: number;
  /** Tailwind size classes for each thumbnail/dropzone tile — bigger on the admin product form. */
  tileClassName?: string;
  /** Noun shown in the helper text ("12 ảnh sản phẩm" vs "4/4 ảnh đánh giá"). */
  helperLabel?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Read via ref so async upload callbacks apply against the latest list, not
  // a stale closure — otherwise a completed upload could resurrect an image
  // the user already removed while it was still uploading.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const uploadOne = useCallback(
    (draftId: string, file: File) => {
      uploadFn(file)
        .then(({ url, publicId }) => {
          onChange(
            imagesRef.current.map((img) =>
              img.id === draftId ? { ...img, url, publicId, status: "done" as const } : img,
            ),
          );
        })
        .catch((err) => {
          const message = err instanceof ApiRequestError ? err.message : "Tải ảnh lên thất bại.";
          onChange(
            imagesRef.current.map((img) =>
              img.id === draftId ? { ...img, status: "error" as const, error: message } : img,
            ),
          );
        });
    },
    [onChange, uploadFn],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (incoming.length === 0) return;

      const room = maxImages === undefined ? incoming.length : maxImages - images.length;
      if (room <= 0) {
        setError(`Tối đa ${maxImages} ${helperLabel}.`);
        return;
      }

      const accepted = incoming.slice(0, room);
      setError(incoming.length > accepted.length ? `Chỉ thêm được ${accepted.length} ${helperLabel} (tối đa ${maxImages}).` : null);

      const drafts: DraftImage[] = accepted.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        url: URL.createObjectURL(file),
        name: file.name,
        status: "uploading",
      }));
      onChange([...images, ...drafts]);
      drafts.forEach((draft, i) => uploadOne(draft.id, accepted[i]));
    },
    [images, maxImages, helperLabel, onChange, uploadOne],
  );

  // Paste-to-upload: copy an image anywhere and paste it while this dropzone is focused/hovered.
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    function onPaste(event: ClipboardEvent) {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        addFiles(files);
      }
    }
    zone.addEventListener("paste", onPaste);
    return () => zone.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const removeImage = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (target?.status === "uploading" && target.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    if (target?.publicId && deleteFn) {
      deleteFn(target.publicId).catch((err) => {
        console.error("Không thể xóa ảnh trên Cloudinary:", err);
      });
    }
    onChange(images.filter((img) => img.id !== id));
    setError(null);
  };

  const makeCover = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (!target) return;
    onChange([target, ...images.filter((img) => img.id !== id)]);
  };

  return (
    <div className="space-y-xs">
      <div className="flex flex-wrap gap-xs">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`group relative ${tileClassName} shrink-0 rounded-lg overflow-hidden border border-outline-variant/40 bg-white`}
          >
            <Image src={img.url} alt={img.name} fill sizes="128px" unoptimized className="object-cover" />
            {img.status === "uploading" && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Icon name="progress_activity" className="animate-spin text-primary" />
              </div>
            )}
            {img.status === "error" && (
              <div
                className="absolute inset-0 bg-error/10 flex items-center justify-center"
                title={img.error}
              >
                <Icon name="error" className="text-error" />
              </div>
            )}
            {index === 0 && img.status === "done" && deleteFn && (
              <span className="absolute bottom-0.5 left-0.5 bg-primary text-on-primary text-[9px] font-bold uppercase px-1 rounded">
                Bìa
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              {index !== 0 && img.status === "done" && deleteFn && (
                <button
                  type="button"
                  onClick={() => makeCover(img.id)}
                  aria-label={`Đặt ${img.name} làm ảnh bìa`}
                  className="p-0.5 bg-white rounded-full text-on-surface hover:text-primary"
                >
                  <Icon name="star" className="!text-[14px]" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                aria-label={`Xóa ${img.name}`}
                className="p-0.5 bg-white rounded-full text-on-surface hover:text-error"
              >
                <Icon name="close" className="!text-[14px]" />
              </button>
            </div>
          </div>
        ))}

        {(maxImages === undefined || images.length < maxImages) && (
          <div
            ref={zoneRef}
            tabIndex={0}
            role="button"
            aria-label={`Vùng tải ${helperLabel}: kéo thả, dán (Ctrl+V) hoặc bấm để chọn ảnh`}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
            }}
            title="Kéo thả ảnh vào đây, dán (Ctrl+V) hoặc bấm để chọn"
            className={`flex flex-col items-center justify-center gap-0.5 text-center ${tileClassName} shrink-0 rounded-lg border-2 border-dashed cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDragging
                ? "border-primary bg-primary-container/10"
                : "border-outline-variant hover:border-primary/60 bg-surface-container-low"
            }`}
          >
            <Icon name="add_photo_alternate" className="text-primary !text-[20px]" />
            <span className="text-[10px] leading-tight text-on-surface-variant px-1">Kéo/dán/chọn</span>
            <label htmlFor={inputId} className="sr-only">
              Chọn tệp ảnh
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </div>

      <p className="text-[11px] text-on-surface-variant">
        {images.length}
        {maxImages !== undefined ? `/${maxImages}` : ""} {helperLabel} · JPG, PNG, WebP
      </p>
      {error && (
        <p className="flex items-center gap-1 text-error text-[11px]">
          <Icon name="error" className="!text-[14px]" />
          {error}
        </p>
      )}
    </div>
  );
}
