"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function StockNotifyForm({ productName }: { productName: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="flex items-center gap-xs text-primary font-label-md text-label-md p-md bg-primary-container/10 rounded-xl">
        <Icon name="mark_email_read" filled />
        Đã ghi nhận! Chúng tôi sẽ báo cho bạn qua email khi &quot;{productName}&quot; có hàng trở
        lại.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="flex flex-col sm:flex-row gap-2"
    >
      <label htmlFor="stock-notify-email" className="sr-only">
        Email nhận thông báo
      </label>
      <input
        id="stock-notify-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email của bạn"
        className="flex-1 bg-surface-container-low border-none rounded-xl px-md py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <button
        type="submit"
        className="px-lg py-3 bg-on-surface text-surface font-label-md text-label-md rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2"
      >
        <Icon name="notifications_active" />
        Báo khi có hàng
      </button>
    </form>
  );
}
