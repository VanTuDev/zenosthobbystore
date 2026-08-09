import type { Metadata } from "next";
import { ContactFullscreenShell } from "./_components/contact-fullscreen-shell";
import { SupportChannelsCard } from "./_components/support-channels-card";
import { ContactTicketForm } from "./_components/contact-ticket-form";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ ZENOST Hobby Store để hỏi thông tin sản phẩm, PRE-ORDER, bảo hành hoặc hợp tác quảng bá.",
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return <ContactFullscreenShell left={<SupportChannelsCard />} right={<ContactTicketForm />} />;
}
