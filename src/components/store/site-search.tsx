"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function submit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tìm kiếm sản phẩm"
        aria-expanded={open}
        className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
      >
        <Icon name="search" />
      </button>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="fixed left-4 right-4 top-16 mt-sm flex items-center gap-xs rounded-xl border border-outline-variant/30 bg-white p-sm shadow-2xl z-50 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-80"
          role="search"
        >
          <Icon name="search" className="text-on-surface-variant shrink-0" />
          <label htmlFor="site-search-input" className="sr-only">
            Tìm kiếm sản phẩm
          </label>
          <input
            ref={inputRef}
            id="site-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mô hình, thương hiệu..."
            className="flex-1 bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant"
          />
        </form>
      )}
    </div>
  );
}
