"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-sm p-lg bg-surface-container-low rounded-xl">
        <Icon name="mark_email_read" filled className="!text-[32px] text-primary" />
        <p className="font-label-md text-label-md text-on-surface">Đã gửi tin nhắn!</p>
        <p className="text-on-surface-variant text-body-md">
          Đây là bản demo — không có email thật nào được gửi. Trong sản phẩm thật, đội ngũ ZENOS
          sẽ phản hồi trong vòng 24 giờ.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-md bg-surface-container-low p-lg rounded-xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <div className="flex flex-col gap-xs">
          <label htmlFor="contact-name" className="font-label-md text-label-md text-on-surface-variant">
            Họ tên
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            className="bg-white border-none rounded-lg p-md focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="contact-email" className="font-label-md text-label-md text-on-surface-variant">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="bg-white border-none rounded-lg p-md focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col gap-xs">
        <label htmlFor="contact-message" className="font-label-md text-label-md text-on-surface-variant">
          Nội dung
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          placeholder="Bạn cần hỗ trợ gì?"
          className="bg-white border-none rounded-lg p-md focus:ring-2 focus:ring-primary/20 outline-none resize-none"
        />
      </div>
      <Button type="submit">Gửi tin nhắn</Button>
    </form>
  );
}
