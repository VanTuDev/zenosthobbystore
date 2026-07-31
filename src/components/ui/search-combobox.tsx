"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

/**
 * Text input + dropdown that searches via a backend call instead of filtering a preloaded list —
 * `onSearch` is debounced so it fires once per pause in typing, not once per keystroke.
 */
export function SearchCombobox<T>({
  id,
  placeholder,
  selected,
  disabled,
  disabledPlaceholder,
  required,
  getKey,
  getLabel,
  onSearch,
  onSelect,
  loadingLabel = "Đang tải...",
  emptyLabel = "Không tìm thấy kết quả",
  className,
}: {
  id: string;
  placeholder: string;
  selected: T | null;
  disabled?: boolean;
  disabledPlaceholder?: string;
  required?: boolean;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onSearch: (query: string) => Promise<T[]>;
  onSelect: (item: T | null) => void;
  loadingLabel?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected ? getLabel(selected) : "");
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const requestIdRef = useRef(0);
  const selectedKey = selected ? getKey(selected) : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the input text when the parent swaps `selected` (e.g. resetting the ward when the province changes)
    setQuery(selected ? getLabel(selected) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  useEffect(() => {
    if (!open || disabled) return;
    const requestId = ++requestIdRef.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the dropdown as loading before the debounced search call resolves
    setIsLoading(true);
    onSearch(debouncedQuery)
      .then((results) => {
        if (requestIdRef.current === requestId) setOptions(results);
      })
      .catch(() => {
        if (requestIdRef.current === requestId) setOptions([]);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, disabled, debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selected ? getLabel(selected) : "");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedKey]);

  function handleSelect(item: T) {
    onSelect(item);
    setQuery(getLabel(item));
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setQuery("");
    setOptions([]);
  }

  return (
    <div className={`relative ${className ?? ""}`} ref={rootRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          required={required && !selected}
          disabled={disabled}
          value={query}
          placeholder={disabled ? (disabledPlaceholder ?? placeholder) : placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (selected) onSelect(null);
            setOpen(true);
          }}
          autoComplete="off"
          className="w-full bg-surface-container-low border-none rounded-lg p-sm pr-10 focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {query && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Xóa lựa chọn"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 transition-colors"
          >
            <Icon name="close" className="text-base" />
          </button>
        ) : (
          <Icon
            name="search"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base"
          />
        )}
      </div>

      {open && !disabled && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-white border border-outline-variant/30 shadow-lg py-1"
        >
          {isLoading && <li className="px-sm py-sm text-label-sm text-on-surface-variant">{loadingLabel}</li>}
          {!isLoading && options.length === 0 && (
            <li className="px-sm py-sm text-label-sm text-on-surface-variant">{emptyLabel}</li>
          )}
          {!isLoading &&
            options.map((item) => (
              <li key={getKey(item)} role="option" aria-selected={getKey(item) === selectedKey}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-sm py-sm text-body-md transition-colors hover:bg-primary/5 ${
                    getKey(item) === selectedKey ? "text-primary font-medium" : "text-on-surface"
                  }`}
                >
                  {getLabel(item)}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
