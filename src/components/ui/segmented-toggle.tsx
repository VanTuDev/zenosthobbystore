import { Icon } from "@/components/ui/icon";

/** Compact button-group toggle for small, mutually-exclusive option sets (e.g. status). */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="grid gap-1.5 p-1 bg-surface-container-low border border-outline-variant/40 rounded-xl"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-label-md text-xs font-medium transition-all ${
              active
                ? "bg-white text-primary shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"
            }`}
          >
            {opt.icon && <Icon name={opt.icon} className="!text-[16px]" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
