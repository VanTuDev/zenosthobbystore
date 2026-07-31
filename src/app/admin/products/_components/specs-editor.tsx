"use client";

import { Icon } from "@/components/ui/icon";

export type Spec = { label: string; value: string };

const MAX_SPECS = 12;

export function SpecsEditor({ specs, onChange }: { specs: Spec[]; onChange: (specs: Spec[]) => void }) {
  const atLimit = specs.length >= MAX_SPECS;

  const update = (index: number, patch: Partial<Spec>) => {
    onChange(specs.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  };

  const remove = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const add = () => {
    if (atLimit) return;
    onChange([...specs, { label: "", value: "" }]);
  };

  return (
    <div className="space-y-xs">
      {specs.length > 0 && (
        <div className="space-y-1">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-center gap-1">
              <input
                type="text"
                value={spec.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Chất liệu"
                className="w-[38%] bg-white border-none rounded-lg px-sm py-1.5 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => update(index, { value: e.target.value })}
                placeholder="PVC & ABS"
                className="flex-1 bg-white border-none rounded-lg px-sm py-1.5 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Xóa thông số"
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors shrink-0"
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
        Thêm thông số ({specs.length}/{MAX_SPECS})
      </button>
    </div>
  );
}
