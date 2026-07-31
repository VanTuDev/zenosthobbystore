import { Icon } from "@/components/ui/icon";

export type Tab<K extends string> = { key: K; label: string; icon?: string };

type TabGroupProps<K extends string> = {
  tabs: readonly Tab<K>[];
  active: K;
  onChange: (key: K) => void;
  /** `sm` = compact pill row (used above dense data tables); `md` = larger card-style row. */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Segmented tab switcher used above admin data tables/sections (status
 * filters on Orders/Finance/Promotions tables, the Danh mục/Thư mục switch
 * on the Categories page). Purely presentational — the caller owns the
 * active-tab state and filtering logic.
 */
export function TabGroup<K extends string>({
  tabs,
  active,
  onChange,
  size = "sm",
  className,
}: TabGroupProps<K>) {
  const isSm = size === "sm";

  return (
    <div
      className={`flex flex-wrap ${
        isSm
          ? "bg-white rounded-md p-0.5 border border-outline-variant/40"
          : "bg-surface-container rounded-lg p-1 border border-outline-variant/30"
      } ${className ?? ""}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={isActive}
            className={
              isSm
                ? `px-sm py-1 rounded font-label-sm text-label-sm transition-colors ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`
                : `flex items-center gap-xs px-md py-1.5 rounded-md font-label-md text-label-md transition-colors ${
                    isActive
                      ? "bg-surface-container-lowest shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`
            }
          >
            {tab.icon && <Icon name={tab.icon} className="!text-[18px]" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
