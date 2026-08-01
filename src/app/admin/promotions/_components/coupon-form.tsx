"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { FieldLabel, textFieldClass } from "@/components/ui/form-field";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { useToast } from "@/components/ui/toast";
import { createPromotion } from "@/lib/api/promotions";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiPromotion } from "@/lib/api-types";

const TYPE_OPTIONS: { value: "percentage" | "fixed"; label: string; icon: string }[] = [
  { value: "percentage", label: "Phần trăm (%)", icon: "percent" },
  { value: "fixed", label: "Số tiền cố định", icon: "payments" },
];

function randomCode() {
  return `ZENOS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateVn(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function CouponForm({ onCreated }: { onCreated?: (promotion: ApiPromotion) => void }) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState(() => randomCode());
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(10);
  const [startDate, setStartDate] = useState(() => isoDate(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return isoDate(d);
  });
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<ApiPromotion | null>(null);

  function resetForm() {
    setName("");
    setCode(randomCode());
    setType("percentage");
    setValue(10);
    setStartDate(isoDate(new Date()));
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setEndDate(isoDate(d));
    setUsageLimit("");
    setError(null);
    setCreated(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Vui lòng nhập tên khuyến mãi.");
    if (!code.trim()) return setError("Vui lòng nhập mã coupon.");
    if (value <= 0) return setError("Mức giảm phải lớn hơn 0.");
    if (type === "percentage" && value > 100) return setError("Phần trăm giảm không được vượt quá 100%.");
    if (new Date(endDate) < new Date(startDate)) return setError("Ngày kết thúc phải sau ngày bắt đầu.");

    setSaving(true);
    try {
      const status = new Date() < new Date(startDate) ? "scheduled" : "active";
      const { promotion } = await createPromotion({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        value,
        appliesTo: "Toàn bộ đơn hàng",
        startDate,
        endDate,
        status,
        usageLimit: usageLimit ? Number(usageLimit) : 0,
      });
      showToast(`Đã tạo mã "${promotion.code}".`, "success");
      setCreated(promotion);
      onCreated?.(promotion);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Tạo mã thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <div className="text-center py-lg">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-md animate-pop">
          <Icon name="check_circle" filled className="!text-[36px]" />
        </span>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Đã tạo mã thành công!</h3>
        <p className="text-on-surface-variant font-body-md mb-lg">
          Mã đã sẵn sàng sử dụng {created.status === "active" ? "ngay" : `từ ${formatDateVn(startDate)}`}.
        </p>
        <div className="flex items-center justify-center gap-sm p-md bg-surface-container-low rounded-xl border border-outline-variant/30 mb-lg max-w-80 mx-auto">
          <span className="font-headline-sm text-headline-sm uppercase tracking-widest text-on-surface">
            {created.code}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(created.code)}
            className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
            aria-label="Sao chép mã"
          >
            <Icon name="content_copy" className="!text-[18px]" />
          </button>
        </div>
        <Button type="button" variant="secondary" onClick={resetForm}>
          Tạo mã khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <FieldLabel htmlFor="promo-name" required>
          Tên khuyến mãi
        </FieldLabel>
        <input
          id="promo-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vd: Ưu đãi mùa hè"
          className={textFieldClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="promo-code" required>
          Mã coupon
        </FieldLabel>
        <div className="relative">
          <input
            id="promo-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${textFieldClass} pr-12 uppercase tracking-widest font-bold text-primary`}
          />
          <button
            type="button"
            onClick={() => setCode(randomCode())}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
            aria-label="Tạo mã ngẫu nhiên"
          >
            <Icon name="autorenew" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <FieldLabel>Loại giảm giá</FieldLabel>
          <SegmentedToggle options={TYPE_OPTIONS} value={type} onChange={setType} />
        </div>
        <div>
          <FieldLabel htmlFor="promo-value" required>
            Mức giảm
          </FieldLabel>
          <div className="relative">
            <input
              id="promo-value"
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className={`${textFieldClass} pr-10 font-bold`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
              {type === "percentage" ? "%" : "đ"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <FieldLabel htmlFor="promo-start" required>
            Ngày bắt đầu
          </FieldLabel>
          <input
            id="promo-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={textFieldClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="promo-end" required>
            Ngày kết thúc
          </FieldLabel>
          <input
            id="promo-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={textFieldClass}
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="promo-limit">Giới hạn sử dụng</FieldLabel>
        <input
          id="promo-limit"
          type="number"
          min={0}
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          placeholder="Không giới hạn"
          className={textFieldClass}
        />
      </div>

      <div className="p-md bg-tertiary-container/10 rounded-xl border border-tertiary/10 flex items-center gap-sm">
        <Icon name="info" className="text-tertiary" />
        <p className="text-label-sm text-on-surface">
          Mã này sẽ hết hạn vào <span className="font-bold">{formatDateVn(endDate)}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error font-label-md text-xs">
          <Icon name="error" className="shrink-0 !text-[16px] mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={saving}
        className="w-full py-4 rounded-xl shadow-lg shadow-primary/30 disabled:opacity-60"
      >
        {saving ? (
          <>
            <Icon name="progress_activity" className="animate-spin" /> Đang tạo mã...
          </>
        ) : (
          "Kích hoạt mã ngay"
        )}
      </Button>
    </form>
  );
}
