"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import { ApiRequestError } from "@/lib/api-client";
import { updateOrderPaymentProof } from "@/lib/api/orders";
import { deleteProductImage, uploadPaymentProofImage } from "@/lib/api/uploads";
import type { ApiOrder } from "@/lib/api-types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const MAX_IMAGE_DIMENSION = 1600;
type ProofImage = ApiOrder["paymentProofImages"][number];

async function optimizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob || blob.size >= file.size) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "giao-dich";
    return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export function PaymentProofModal({ order, onClose, onUpdated }: {
  order: ApiOrder;
  onClose: () => void;
  onUpdated: (order: ApiOrder) => void;
}) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ProofImage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<ProofImage | null>(null);
  const images = currentOrder.paymentProofImages ?? [];

  function validateFiles(files: File[], replacing = false) {
    if (!replacing && images.length + files.length > MAX_IMAGES) return `Mỗi đơn chỉ được lưu tối đa ${MAX_IMAGES} ảnh.`;
    if (replacing && files.length !== 1) return "Vui lòng chọn đúng một ảnh để thay thế.";
    if (files.some((file) => !file.type.startsWith("image/"))) return "Vui lòng chỉ chọn file ảnh JPG, PNG hoặc WebP.";
    if (files.some((file) => file.size > MAX_FILE_SIZE)) return "Mỗi ảnh không được lớn hơn 5MB.";
    return null;
  }

  async function saveFiles(files: File[], imageToReplace: ProofImage | null = null) {
    if (files.length === 0 || busy) return;
    const validationError = validateFiles(files, Boolean(imageToReplace));
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError(null);
    const uploaded: ProofImage[] = [];
    try {
      const optimizedFiles = await Promise.all(files.map(optimizeImage));
      const uploadResults = await Promise.allSettled(optimizedFiles.map(uploadPaymentProofImage));
      for (const result of uploadResults) {
        if (result.status === "fulfilled") uploaded.push(result.value);
      }
      const failedUpload = uploadResults.find((result) => result.status === "rejected");
      if (failedUpload?.status === "rejected") throw failedUpload.reason;
      const nextImages = imageToReplace
        ? images.map((image) => image.publicId === imageToReplace.publicId ? uploaded[0] : image)
        : [...images, ...uploaded];
      const { order: updatedOrder } = await updateOrderPaymentProof(currentOrder.id, nextImages);
      setCurrentOrder(updatedOrder);
      onUpdated(updatedOrder);
      if (imageToReplace) void deleteProductImage(imageToReplace.publicId).catch(() => undefined);
    } catch (uploadError) {
      await Promise.all(uploaded.map((image) => deleteProductImage(image.publicId).catch(() => undefined)));
      setError(uploadError instanceof ApiRequestError ? uploadError.message : "Không thể lưu ảnh giao dịch.");
    } finally {
      replaceTargetRef.current = null;
      setBusy(false);
    }
  }

  async function removeImage(image: ProofImage) {
    if (busy || !window.confirm("Xóa ảnh giao dịch này?")) return;
    setBusy(true);
    setError(null);
    try {
      const nextImages = images.filter((item) => item.publicId !== image.publicId);
      const { order: updatedOrder } = await updateOrderPaymentProof(currentOrder.id, nextImages);
      setCurrentOrder(updatedOrder);
      setSelectedImage((current) => current?.publicId === image.publicId ? null : current);
      onUpdated(updatedOrder);
      void deleteProductImage(image.publicId).catch(() => undefined);
    } catch (removeError) {
      setError(removeError instanceof ApiRequestError ? removeError.message : "Không thể xóa ảnh giao dịch.");
    } finally {
      setBusy(false);
    }
  }

  const canAdd = images.length < MAX_IMAGES && !busy;

  return (
    <Modal
      onClose={onClose}
      closeDisabled={busy}
      labelledBy="payment-proof-title"
      icon="receipt_long"
      title="Ảnh giao dịch ngân hàng"
      subtitle={`${currentOrder.facebookName || currentOrder.customerName} · ${images.length}/${MAX_IMAGES} ảnh`}
      maxWidthClassName="max-w-[860px]"
    >
      <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
        <div
          role="button"
          tabIndex={canAdd ? 0 : -1}
          onClick={() => {
            if (!canAdd || !inputRef.current) return;
            replaceTargetRef.current = null;
            inputRef.current.multiple = true;
            inputRef.current.click();
          }}
          onKeyDown={(event) => {
            if (canAdd && (event.key === "Enter" || event.key === " ") && inputRef.current) {
              replaceTargetRef.current = null;
              inputRef.current.multiple = true;
              inputRef.current.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (canAdd) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (canAdd) void saveFiles(Array.from(event.dataTransfer.files));
          }}
          className={`flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed px-5 py-5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
            !canAdd
              ? "cursor-not-allowed border-outline-variant/40 bg-surface-container-low text-on-surface-variant"
              : dragging
                ? "cursor-pointer border-primary bg-primary/5"
                : "cursor-pointer border-outline-variant/60 bg-surface-container-low hover:border-primary/60"
          }`}
        >
          <div>
            <Icon name={busy ? "progress_activity" : images.length >= MAX_IMAGES ? "check_circle" : "add_photo_alternate"} className={`!text-[36px] text-primary ${busy ? "animate-spin" : ""}`} />
            <p className="mt-1 font-bold">
              {busy ? "Đang tải ảnh lên..." : images.length >= MAX_IMAGES ? "Đã đủ 5 ảnh" : "Kéo ảnh vào đây hoặc bấm để chọn"}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">Có thể chọn nhiều ảnh cùng lúc · Tối đa 5 ảnh, mỗi ảnh 5MB</p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            const imageToReplace = replaceTargetRef.current;
            void saveFiles(Array.from(event.target.files ?? []), imageToReplace);
            event.target.value = "";
          }}
        />

        {error && <p className="flex items-center gap-1.5 text-sm text-error"><Icon name="error" className="!text-[18px]" />{error}</p>}

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, index) => (
              <div key={image.publicId} className="group relative overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
                <button type="button" onClick={() => setSelectedImage(image)} className="block aspect-square w-full overflow-hidden" title={`Xem rõ ảnh ${index + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={`Ảnh giao dịch ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </button>
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="text-xs font-bold text-on-surface-variant">Ảnh {index + 1}</span>
                  <div className="flex items-center gap-0.5">
                    <button type="button" onClick={() => {
                      if (!inputRef.current) return;
                      replaceTargetRef.current = image;
                      inputRef.current.multiple = false;
                      inputRef.current.click();
                    }} disabled={busy} className="rounded-md p-1 text-primary hover:bg-primary/10 disabled:opacity-50" title="Thay ảnh">
                      <Icon name="sync" className="!text-[17px]" />
                    </button>
                    <button type="button" onClick={() => void removeImage(image)} disabled={busy} className="rounded-md p-1 text-error hover:bg-error/10 disabled:opacity-50" title="Xóa ảnh">
                      <Icon name="delete" className="!text-[17px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-on-surface-variant">Đơn hàng này chưa có ảnh giao dịch.</p>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Xem ảnh giao dịch" onClick={() => setSelectedImage(null)}>
          <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" title="Đóng ảnh">
            <Icon name="close" className="!text-[28px]" />
          </button>
          <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold text-white hover:bg-white/25">
            <Icon name="open_in_new" className="!text-[18px]" /> Mở ảnh gốc
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedImage.url} alt="Ảnh giao dịch phóng lớn" className="max-h-[90vh] max-w-[94vw] object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </Modal>
  );
}
