"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { uploadProductImage, deleteProductImage } from "@/lib/api/uploads";
import { ApiRequestError } from "@/lib/api-client";

export type DraftSingleImage = {
  url: string;
  publicId?: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

/** Single-image drag/drop/paste/click uploader — same Cloudinary pipeline as ImageDropzone, just one tile. */
export function SingleImageUpload({
  image,
  onChange,
}: {
  image: DraftSingleImage | null;
  onChange: (image: DraftSingleImage | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    (file: File) => {
      const previousPublicId = image?.publicId;
      onChange({ url: URL.createObjectURL(file), status: "uploading" });
      uploadProductImage(file)
        .then(({ url, publicId }) => {
          onChange({ url, publicId, status: "done" });
          if (previousPublicId) {
            deleteProductImage(previousPublicId).catch((err) => {
              console.error("Không thể xóa ảnh cũ trên Cloudinary:", err);
            });
          }
        })
        .catch((err) => {
          const message = err instanceof ApiRequestError ? err.message : "Tải ảnh lên thất bại.";
          onChange({ url: "", status: "error", error: message });
        });
    },
    [image?.publicId, onChange],
  );

  const addFile = useCallback(
    (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) {
        setError("Vui lòng chọn một tệp ảnh (JPG, PNG, WebP).");
        return;
      }
      setError(null);
      upload(file);
    },
    [upload],
  );

  const removeImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (image?.publicId) {
      deleteProductImage(image.publicId).catch((err) => {
        console.error("Không thể xóa ảnh trên Cloudinary:", err);
      });
    }
    onChange(null);
    setError(null);
  };

  const hasImage = Boolean(image && image.url);

  return (
    <div className="w-full">
      <div
        tabIndex={0}
        role="button"
        aria-label={hasImage ? "Đổi ảnh" : "Vùng tải ảnh: kéo thả, dán (Ctrl+V) hoặc bấm để chọn ảnh"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onPaste={(e) => {
          if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            addFile(e.clipboardData.files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) addFile(e.dataTransfer.files);
        }}
        title="Kéo thả ảnh vào đây, dán (Ctrl+V) hoặc bấm để chọn"
        className={`relative flex flex-col items-center justify-center gap-1 text-center w-full h-36 rounded-xl cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden ${
          hasImage
            ? "border border-outline-variant/40 bg-white"
            : `border-2 border-dashed ${isDragging ? "border-primary bg-primary-container/10" : "border-outline-variant hover:border-primary/60 bg-surface-container-low"}`
        }`}
      >
        {hasImage ? (
          <>
            <Image src={image!.url} alt="Ảnh danh mục" fill sizes="480px" unoptimized className="object-cover" />
            {image!.status === "uploading" && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Icon name="progress_activity" className="animate-spin text-primary" />
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              aria-label="Xóa ảnh"
              className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-error text-white shadow hover:brightness-110 transition-all"
            >
              <Icon name="close" className="!text-[16px]" />
            </button>
          </>
        ) : (
          <>
            <Icon name="upload" className="text-on-surface-variant !text-[24px]" />
            <span className="font-body-md text-body-sm text-on-surface">
              <span className="font-semibold">Bấm để tải</span> hoặc kéo thả
            </span>
            <span className="text-[12px] text-on-surface-variant">JPG, PNG, WebP (Tối đa 5MB)</span>
          </>
        )}
      </div>

      <label htmlFor="single-image-input" className="sr-only">
        Chọn tệp ảnh
      </label>
      <input
        ref={inputRef}
        id="single-image-input"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) addFile(e.target.files);
          e.target.value = "";
        }}
      />

      {(error || image?.status === "error") && (
        <p className="flex items-center gap-1 text-error text-[11px] mt-1">
          <Icon name="error" className="!text-[14px] shrink-0" />
          {error ?? image?.error}
        </p>
      )}
    </div>
  );
}
