import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";
import { ContactForm } from "./_components/contact-form";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ đội ngũ ZENOS Hobby Store để được tư vấn về sản phẩm, đơn hàng và bảo hành.",
  alternates: { canonical: "/lien-he" },
};

const CONTACT_CHANNELS = [
  { icon: "mail", label: "support@zenoshobbystore.vn" },
  { icon: "call", label: "1900 6868 (8:00 – 21:00, T2 – CN)" },
  { icon: "location_on", label: "Showroom: 45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" },
];

export default function ContactPage() {
  return (
    <PolicyPage
      title="Liên hệ"
      intro="Có câu hỏi về sản phẩm, đơn hàng hay bảo hành? Gửi tin nhắn cho chúng tôi hoặc liên hệ trực tiếp qua các kênh dưới đây."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <ContactForm />
        <div className="space-y-md">
          {CONTACT_CHANNELS.map((c) => (
            <div key={c.label} className="flex items-center gap-sm p-md bg-white rounded-xl border border-outline-variant/20">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                <Icon name={c.icon} />
              </span>
              <span className="text-body-md text-on-surface">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PolicyPage>
  );
}
