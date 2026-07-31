"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

const MAX_HIGHLIGHTS = 4;

const PRESETS = [
  "Nhập khẩu chính hãng",
  "Full box, nguyên seal",
  "Chi tiết sơn tay thủ công",
  "Đế trưng bày độc quyền",
  "Phiên bản giới hạn",
  "Kèm phụ kiện thay thế",
];

export function HighlightsEditor({
  highlights,
  onChange,
}: {
  highlights: string[];
  onChange: (highlights: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const atLimit = highlights.length >= MAX_HIGHLIGHTS;

  const toggle = (value: string) => {
    if (highlights.includes(value)) {
      onChange(highlights.filter((h) => h !== value));
      return;
    }
    if (atLimit) return;
    onChange([...highlights, value]);
  };

  const addCustom = () => {
    const value = draft.trim();
    if (!value || atLimit || highlights.includes(value)) return;
    onChange([...highlights, value]);
    setDraft("");
  };

  return (
    <div className="space-y-xs">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => {
          const active = highlights.includes(preset);
          const disabled = !active && atLimit;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => toggle(preset)}
              disabled={disabled}
              aria-pressed={active}
              className={`px-xs py-0.5 rounded-full text-[11px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white text-on-surface border-outline-variant hover:border-primary"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      <div className="flex gap-xs items-center">
        <label htmlFor="highlight-input" className="sr-only">
          Điểm nổi bật khác
        </label>
        <input
          id="highlight-input"
          type="text"
          value={draft}
          disabled={atLimit}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Điểm nổi bật khác..."
          className="flex-1 bg-white border-none rounded-lg px-sm py-xs text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={atLimit || !draft.trim()}
          className="px-sm py-xs rounded-lg bg-on-surface text-surface text-[12px] font-bold hover:bg-primary transition-colors disabled:opacity-40"
        >
          <Icon name="add" className="!text-[14px]" />
        </button>
        <span className="text-[11px] text-on-surface-variant shrink-0">
          {highlights.length}/{MAX_HIGHLIGHTS}
        </span>
      </div>
    </div>
  );
}
