import type { Metadata } from "next";
import { ContactFullscreenShell } from "./_components/contact-fullscreen-shell";
import { SupportChannelsCard } from "./_components/support-channels-card";
import { ContactTicketForm } from "./_components/contact-ticket-form";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ đội ngũ ZENOST Hobby Store để được tư vấn về sản phẩm, đơn hàng và bảo hành.",
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return <ContactFullscreenShell left={<SupportChannelsCard />} right={<ContactTicketForm />} />;
}
