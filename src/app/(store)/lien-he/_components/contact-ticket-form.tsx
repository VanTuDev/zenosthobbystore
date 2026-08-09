"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { createContactTicket } from "@/lib/api/contact-tickets";
import { uploadContactImage } from "@/lib/api/uploads";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiContactTicket } from "@/lib/api-types";

const SUBJECT_OPTIONS: { value: ApiContactTicket["subject"]; label: string }[] = [
  { value: "product", label: "Hỏi thông tin sản phẩm" },
  { value: "order", label: "Hỏi về PRE-ORDER" },
  { value: "return_warranty", label: "Bảo hành sản phẩm đã mua" },
  { value: "payment", label: "Hợp tác quảng bá / Affiliate" },
  { value: "other", label: "Báo link, video lỗi hoặc nội dung khác" },
];

const MAX_IMAGES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type DraftImage = { id: string; name: string; status: "uploading" | "done" | "error"; url?: string; error?: string };

const fieldLabelClass = "block font-label-sm text-[11px] text-on-surface-variant font-bold uppercase tracking-widest mb-1.5";
const fieldClass =
  "w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-[#ff5a36] focus:ring-2 focus:ring-[#ff5a36]/15 transition-colors";

export function ContactTicketForm() {
  const [subject, setSubject] = useState<ApiContactTicket["subject"] | "">("");
  const [orderCode, setOrderCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploadingImages = images.some((img) => img.status === "uploading");
  const remainingSlots = MAX_IMAGES - images.length;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, remainingSlots);
    if (fileInputRef.current) fileInputRef.current.value = "";

    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      if (file.size > MAX_FILE_BYTES) {
        setImages((prev) => [...prev, { id, name: file.name, status: "error", error: "Ảnh vượt quá 5MB" }]);
        continue;
      }

      setImages((prev) => [...prev, { id, name: file.name, status: "uploading" }]);
      uploadContactImage(file)
        .then(({ url }) => {
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "done", url } : img)));
        })
        .catch((err) => {
          const message = err instanceof ApiRequestError ? err.message : "Tải ảnh lên thất bại.";
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "error", error: message } : img)));
        });
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!subject) return setError("Vui lòng chọn nội dung cần hỗ trợ.");
    if (!customerName.trim()) return setError("Vui lòng nhập họ và tên.");
    if (!customerEmail.trim()) return setError("Vui lòng nhập email nhận phản hồi.");
    if (!message.trim()) return setError("Vui lòng mô tả nội dung yêu cầu.");
    if (isUploadingImages) return setError("Vui lòng đợi ảnh tải lên xong.");

    setSubmitting(true);
    try {
      await createContactTicket({
        subject,
        orderCode: orderCode.trim() || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        message: message.trim(),
        images: images.filter((img) => img.status === "done").map((img) => img.url!),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="h-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-lg flex flex-col items-center justify-center text-center gap-sm">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ff5a36]/10 text-[#ff5a36]">
          <Icon name="mark_email_read" filled className="!text-[28px]" />
        </span>
        <p className="font-headline-sm text-headline-sm text-on-surface font-bold">Đã gửi yêu cầu hỗ trợ!</p>
        <p className="text-on-surface-variant font-body-md max-w-96">
          Đội ngũ ZENOST đã nhận được yêu cầu và sẽ phản hồi qua email {customerEmail} trong thời gian sớm nhất.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setSubject("");
            setOrderCode("");
            setCustomerName("");
            setCustomerEmail("");
            setMessage("");
            setImages([]);
          }}
          className="mt-sm font-label-md text-label-md text-[#ff5a36] hover:text-[#e04527] transition-colors"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-lg">
      <div className="flex items-start justify-between gap-sm mb-md">
        <div>
          <p className="font-label-sm text-label-sm text-[#ff5a36] font-bold uppercase tracking-widest mb-xs">
            Send a request
          </p>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">Gửi yêu cầu hỗ trợ</h2>
        </div>
        <span className="hidden sm:block font-label-sm text-[11px] text-on-surface-variant font-bold uppercase tracking-widest shrink-0 pt-1">
          Phản hồi qua email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div>
            <label htmlFor="ticket-subject" className={fieldLabelClass}>
              Chủ đề
            </label>
            <select
              id="ticket-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value as ApiContactTicket["subject"])}
              className={`${fieldClass} appearance-none`}
            >
              <option value="" disabled>
                Chọn nội dung cần hỗ trợ
              </option>
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ticket-order-code" className={fieldLabelClass}>
              Mã sản phẩm / hóa đơn — nếu có
            </label>
            <input
              id="ticket-order-code"
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Nhập tên, mã sản phẩm hoặc mã hóa đơn"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="ticket-name" className={fieldLabelClass}>
              Họ và tên
            </label>
            <input
              id="ticket-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="ticket-email" className={fieldLabelClass}>
              Email nhận phản hồi
            </label>
            <input
              id="ticket-email"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="ticket-message" className={fieldLabelClass}>
            Nội dung yêu cầu
          </label>
          <textarea
            id="ticket-message"
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div>
          <p className={fieldLabelClass}>Đính kèm hình ảnh — không bắt buộc</p>
          <div className="flex flex-wrap items-center gap-sm">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={remainingSlots <= 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:border-[#ff5a36]/60 hover:text-[#ff5a36] transition-colors font-label-md text-label-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="add_photo_alternate" className="!text-[18px]" />
              Chọn hình ảnh
            </button>
            <span className="font-body-sm text-[12px] text-on-surface-variant">Tối đa 3 ảnh, mỗi ảnh không quá 5 MB.</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <ul className="flex flex-wrap gap-sm mt-sm">
              {images.map((img) => (
                <li
                  key={img.id}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-[12px]"
                >
                  {img.status === "uploading" && <Icon name="progress_activity" className="!text-[14px] text-on-surface-variant animate-spin" />}
                  {img.status === "done" && <Icon name="check_circle" className="!text-[14px] text-[#ff5a36]" />}
                  {img.status === "error" && <Icon name="error" className="!text-[14px] text-error" />}
                  <span className={`max-w-32 truncate ${img.status === "error" ? "text-error" : "text-on-surface-variant"}`}>
                    {img.status === "error" ? (img.error ?? "Lỗi") : img.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="Xóa ảnh"
                    className="p-0.5 rounded-full text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Icon name="close" className="!text-[14px]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-error font-label-md text-label-sm">
            <Icon name="error" className="!text-[16px] shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || isUploadingImages}
          className="w-full py-3.5 bg-[#ff5a36] text-white font-label-md text-label-md font-bold uppercase tracking-wide rounded-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
          {!submitting && <Icon name="north_east" className="!text-[16px]" />}
        </button>
      </form>
    </div>
  );
}
