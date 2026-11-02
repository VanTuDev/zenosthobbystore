"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ORDER_STATUS_META } from "@/components/ui/order-status-badge";
import { ApiRequestError } from "@/lib/api-client";
import { formatVnd } from "@/lib/format";
import {
  confirmShippingLabel,
  matchShippingLabel,
  type ShippingScanCandidate,
  type ShippingScanInput,
} from "@/lib/api/orders";

const EMPTY_SCAN: ShippingScanInput = { trackingCode: "", recipientName: "", phone: "", address: "" };

function normalizeOcrLine(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseDestinationBlock(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/^[|!¡'`.,\s]+|[|!¡'`.,\s]+$/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);
  const destinationIndex = lines.findIndex((line) => {
    const normalized = normalizeOcrLine(line);
    return normalized === "den" || normalized.startsWith("den ") || normalized.includes("nguoi nhan");
  });
  if (destinationIndex < 0) return { recipientName: "", address: "" };
  const inlineName = lines[destinationIndex].replace(/^.*?(?:Đến|Den|Người nhận|Nguoi nhan)\s*:?\s*/i, "").trim();
  let recipientName = inlineName && normalizeOcrLine(inlineName) !== "den" ? inlineName : "";
  let cursor = destinationIndex + 1;
  if (!recipientName) {
    while (cursor < lines.length && (!lines[cursor] || /\d/.test(lines[cursor]))) cursor += 1;
    recipientName = lines[cursor] ?? "";
    cursor += 1;
  }
  const addressLines: string[] = [];
  for (; cursor < Math.min(lines.length, destinationIndex + 6); cursor += 1) {
    const normalized = normalizeOcrLine(lines[cursor]);
    if (["noi dung", "nguoi gui", "tong sl"].some((word) => normalized.includes(word))) break;
    if (normalized.length > 4 && (addressLines.length > 0 || /\d/.test(lines[cursor]))) addressLines.push(lines[cursor]);
  }
  return { recipientName, address: addressLines.join(", ") };
}

function parseShippingLabel(text: string, destinationText: string): ShippingScanInput {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const compactText = text.toUpperCase().replace(/[\s:._-]+/g, "");
  const trackingCode = (compactText.match(/SPXVN[A-Z0-9]{8,}/)?.[0] ?? compactText.match(/[A-Z]{2,5}[A-Z0-9]{10,}/)?.[0] ?? "").replace(/[^A-Z0-9]/g, "");
  const phone = (text.match(/(?:\+?84|0)(?:[\s.()-]*\d){8,10}/)?.[0] ?? "").replace(/[^+\d]/g, "");
  const croppedDestination = parseDestinationBlock(destinationText);
  const destinationIndex = lines.findIndex((line) => {
    const normalized = normalizeOcrLine(line);
    return normalized === "den" || normalized.startsWith("den ") || normalized.includes("nguoi nhan");
  });

  let recipientName = croppedDestination.recipientName;
  let addressStart = -1;
  if (!recipientName && destinationIndex >= 0) {
    const inlineName = lines[destinationIndex].replace(/^.*?(?:Đến|Den|Người nhận|Nguoi nhan)\s*:?\s*/i, "").trim();
    if (inlineName && normalizeOcrLine(inlineName) !== "den") {
      recipientName = inlineName;
      addressStart = destinationIndex + 1;
    } else {
      recipientName = lines[destinationIndex + 1] ?? "";
      addressStart = destinationIndex + 2;
    }
  }

  const stopWords = ["noi dung hang", "tong sl", "chi dan giao hang", "tien thu", "nguoi gui"];
  const addressLines: string[] = croppedDestination.address ? [croppedDestination.address] : [];
  if (addressLines.length === 0 && addressStart >= 0) {
    for (let index = addressStart; index < Math.min(lines.length, addressStart + 6); index += 1) {
      const line = lines[index];
      const normalized = normalizeOcrLine(line);
      if (stopWords.some((word) => normalized.includes(word))) break;
      if (/^(sdt|dt|phone)\s*/i.test(normalized)) continue;
      if (normalized.length > 3) addressLines.push(line);
    }
  }
  return { trackingCode, recipientName, phone, address: addressLines.join(", ") };
}

async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return { image: file as Blob, width: originalWidth, height: originalHeight };
  }
  context.filter = "grayscale(1) contrast(1.25)";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<{ image: Blob; width: number; height: number }>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve({ image: blob, width: canvas.width, height: canvas.height }) : reject(new Error("Không thể xử lý ảnh.")), "image/jpeg", 0.9);
  });
}

export function ShippingLabelScanner() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scan, setScan] = useState<ShippingScanInput>(EMPTY_SCAN);
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [candidates, setCandidates] = useState<ShippingScanCandidate[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; publicCode: string; trackingCode: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function recognizeFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn hoặc chụp một ảnh nhãn vận đơn.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setRecognizing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    setCandidates([]);
    setSelectedOrderId(null);
    try {
      const prepared = await prepareImage(file);
      const { createWorker } = await import("tesseract.js");
      let ocrStage: "full" | "destination" = "full";
      const worker = await createWorker(["vie", "eng"], undefined, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            const stageProgress = message.progress ?? 0;
            setProgress(Math.round(ocrStage === "full" ? stageProgress * 70 : 70 + stageProgress * 30));
          }
        },
      });
      try {
        const result = await worker.recognize(prepared.image, { rotateAuto: true });
        ocrStage = "destination";
        const destinationResult = await worker.recognize(prepared.image, {
          rectangle: {
            left: Math.round(prepared.width * 0.45),
            top: Math.round(prepared.height * 0.22),
            width: Math.round(prepared.width * 0.54),
            height: Math.round(prepared.height * 0.22),
          },
        });
        const text = result.data.text.trim();
        const destinationText = destinationResult.data.text.trim();
        setOcrText(`${text}\n\n--- VÙNG NGƯỜI NHẬN ---\n${destinationText}`);
        setScan(parseShippingLabel(text, destinationText));
      } finally {
        await worker.terminate();
      }
    } catch (recognizeError) {
      setError(recognizeError instanceof Error ? recognizeError.message : "Không thể đọc nhãn. Vui lòng chụp lại rõ hơn.");
    } finally {
      setRecognizing(false);
    }
  }

  async function findOrders() {
    if (!scan.trackingCode.trim()) {
      setError("Chưa đọc được mã vận đơn. Vui lòng nhập lại mã trên nhãn.");
      return;
    }
    if (!scan.recipientName.trim()) {
      setError("Chưa đọc được tên người nhận. Vui lòng nhập lại tên trên nhãn.");
      return;
    }
    setMatching(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await matchShippingLabel({
        trackingCode: scan.trackingCode.trim().toUpperCase().replace(/\s+/g, ""),
        recipientName: scan.recipientName.trim(),
        phone: scan.phone.trim(),
        address: scan.address.trim(),
      });
      setCandidates(response.candidates);
      setSelectedOrderId(null);
      if (response.candidates.length === 0) setError("Không tìm thấy đơn đang xử lý nào trùng tên này. Hãy kiểm tra và sửa lại tên người nhận.");
    } catch (matchError) {
      setError(matchError instanceof ApiRequestError ? matchError.message : "Không thể đối chiếu đơn hàng.");
    } finally {
      setMatching(false);
    }
  }

  async function confirmShipment() {
    if (!selectedOrderId) return;
    setConfirming(true);
    setError(null);
    try {
      const response = await confirmShippingLabel(selectedOrderId, scan.trackingCode.trim());
      setSuccess({ orderId: response.order.id, publicCode: response.order.publicCode.toUpperCase(), trackingCode: response.order.trackingCode });
      setCandidates([]);
      setSelectedOrderId(null);
    } catch (confirmError) {
      setError(confirmError instanceof ApiRequestError ? confirmError.message : "Không thể cập nhật đơn hàng.");
    } finally {
      setConfirming(false);
    }
  }

  function resetScanner() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setScan(EMPTY_SCAN);
    setOcrText("");
    setProgress(0);
    setCandidates([]);
    setSelectedOrderId(null);
    setError(null);
    setSuccess(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="space-y-5 pb-10">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold text-on-surface">1. Chụp nhãn vận đơn</h2><p className="mt-1 text-sm text-on-surface-variant">Đặt toàn bộ nhãn thẳng trong khung, đủ sáng và không bị lóa.</p></div>
            {previewUrl && <button type="button" onClick={resetScanner} disabled={recognizing || matching || confirming} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold disabled:opacity-50">Làm lại</button>}
          </div>
          <input ref={inputRef} id="shipping-label-photo" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void recognizeFile(file); }} />
          <label htmlFor="shipping-label-photo" className="relative flex min-h-72 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 text-center hover:border-primary">
            {previewUrl ? <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Ảnh nhãn vận đơn" className="max-h-[560px] w-full object-contain" />
            </> : <div className="px-6 py-12"><Icon name="document_scanner" className="!text-[52px] text-primary" /><p className="mt-3 text-lg font-bold text-on-surface">Bấm để mở camera</p><p className="mt-1 text-sm text-on-surface-variant">Hoặc chọn ảnh nhãn đã chụp trong điện thoại</p></div>}
            {recognizing && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-8 text-white"><Icon name="progress_activity" className="animate-spin !text-[42px]" /><p className="mt-3 font-bold">Đang đọc nhãn… {progress}%</p><div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/25"><div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-xs text-white/80">Lần đầu có thể lâu hơn vì điện thoại cần tải bộ nhận dạng tiếng Việt.</p></div>}
          </label>
        </div>

        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-on-surface">2. Kiểm tra tên và mã vận đơn</h2><p className="mt-1 text-sm text-on-surface-variant">Hệ thống sẽ tìm các đơn đang xử lý trùng tên. Địa chỉ chỉ dùng để bạn kiểm tra thủ công ở bước tiếp theo.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-bold">Mã vận đơn *</span><input value={scan.trackingCode} onChange={(event) => setScan((current) => ({ ...current, trackingCode: event.target.value }))} placeholder="SPXVN…" className="w-full rounded-xl border border-outline-variant bg-white px-3 py-3 font-bold uppercase outline-none focus:border-primary" /></label>
            <label className="space-y-1.5"><span className="text-sm font-bold">Tên người nhận *</span><input value={scan.recipientName} onChange={(event) => setScan((current) => ({ ...current, recipientName: event.target.value }))} className="w-full rounded-xl border border-outline-variant bg-white px-3 py-3 outline-none focus:border-primary" /></label>
            <label className="space-y-1.5"><span className="text-sm font-bold">Số điện thoại</span><input value={scan.phone} inputMode="tel" onChange={(event) => setScan((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-xl border border-outline-variant bg-white px-3 py-3 outline-none focus:border-primary" /></label>
            <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-bold">Địa chỉ trên nhãn</span><textarea value={scan.address} onChange={(event) => setScan((current) => ({ ...current, address: event.target.value }))} rows={3} className="w-full resize-y rounded-xl border border-outline-variant bg-white px-3 py-3 outline-none focus:border-primary" /></label>
          </div>
          {ocrText && <details className="mt-4 rounded-xl bg-surface-container-low p-3"><summary className="cursor-pointer text-sm font-bold">Xem văn bản OCR gốc</summary><pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-on-surface-variant">{ocrText}</pre></details>}
          {error && <p className="mt-4 flex items-start gap-2 rounded-xl bg-error/10 p-3 text-sm text-error"><Icon name="error" className="!text-[19px]" />{error}</p>}
          <button type="button" onClick={() => void findOrders()} disabled={recognizing || matching || !scan.trackingCode.trim() || !scan.recipientName.trim()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-on-primary disabled:opacity-50"><Icon name={matching ? "progress_activity" : "search"} className={matching ? "animate-spin" : ""} />{matching ? "Đang tìm theo tên…" : "Tìm các đơn trùng tên"}</button>
        </div>
      </div>

      {candidates.length > 0 && <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">3. Kiểm tra từng đơn trùng tên</h2><p className="mt-1 text-sm text-on-surface-variant">Có {candidates.length} đơn trùng tên. So sánh địa chỉ trên nhãn với từng đơn rồi chọn đúng đơn.</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Chỉ cập nhật sau khi bạn xác nhận</span></div>
        <div className="mt-4 space-y-3">{candidates.map((candidate, index) => { const selected = selectedOrderId === candidate.order.id; const statusMeta = ORDER_STATUS_META[candidate.order.status]; return <button key={candidate.order.id} type="button" onClick={() => setSelectedOrderId(candidate.order.id)} className={`w-full rounded-xl border p-4 text-left transition ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-outline-variant/50 hover:border-primary/50"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-primary">Đơn trùng tên {index + 1}/{candidates.length}</p><p className="mt-1 font-bold text-on-surface">#{candidate.order.publicCode.toUpperCase()} · {candidate.order.recipientName || candidate.order.facebookName}</p><p className="mt-1 text-sm text-on-surface-variant">{candidate.order.phone || "Chưa có SĐT"}</p></div><div className="text-right"><span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Tên trùng khớp</span><p className="mt-1 text-xs text-on-surface-variant">{statusMeta.label}</p></div></div><div className="mt-3 rounded-lg border border-outline-variant/50 bg-white p-3"><p className="text-xs font-bold uppercase text-on-surface-variant">Địa chỉ trong đơn</p><p className="mt-1 text-sm font-semibold leading-6 text-on-surface">{candidate.order.address || "Chưa có địa chỉ"}</p></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-on-surface-variant"><span>{candidate.order.itemCount} sản phẩm</span><span>{formatVnd(candidate.order.total)}</span>{candidate.signals.phoneExact && <span className="font-bold text-green-700">Trùng SĐT</span>}{candidate.score > 0 && <span>Địa chỉ OCR tương đồng {candidate.score}%</span>}</div>{selected && <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-primary"><Icon name="check_circle" className="!text-[19px]" />Đã chọn đơn này</p>}</button>; })}</div>
        <button type="button" onClick={() => void confirmShipment()} disabled={!selectedOrderId || confirming} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-on-primary disabled:opacity-50"><Icon name={confirming ? "progress_activity" : "local_shipping"} className={confirming ? "animate-spin" : ""} />{confirming ? "Đang cập nhật…" : "Xác nhận đã vận chuyển và lưu mã"}</button>
      </div>}

      {success && <div className="rounded-2xl border border-green-300 bg-green-50 p-5 text-green-900 shadow-sm"><div className="flex items-start gap-3"><Icon name="check_circle" className="!text-[30px] text-green-600" /><div><h2 className="text-lg font-bold">Đã cập nhật đơn #{success.publicCode}</h2><p className="mt-1 text-sm">Trạng thái: Đã vận chuyển · Mã vận đơn: <strong>{success.trackingCode}</strong></p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/admin/orders/${success.orderId}`} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white">Mở chi tiết đơn</Link><button type="button" onClick={resetScanner} className="rounded-lg border border-green-700 px-3 py-2 text-sm font-bold">Quét nhãn tiếp theo</button></div></div></div></div>}
    </section>
  );
}
