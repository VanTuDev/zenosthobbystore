"use client";

function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function formatThousands(digits: string) {
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

/** Number input that shows live thousands separators (1.250.000) while still storing a plain digit string. */
export function PriceInput({
  id,
  value,
  onChange,
  placeholder,
  tone = "default",
}: {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  tone?: "default" | "muted";
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={formatThousands(value)}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
        placeholder={placeholder}
        className={`w-full bg-white border-none rounded-lg pl-3 pr-9 py-2.5 font-body-md text-body-md text-right ring-1 transition-all ${
          tone === "muted"
            ? "ring-tertiary/30 focus:ring-tertiary bg-tertiary-container/5"
            : "ring-outline-variant focus:ring-2 focus:ring-primary"
        }`}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[12px] font-bold">
        đ
      </span>
    </div>
  );
}
