import type { Metadata } from "next";
import { PolicyPage } from "@/components/store/policy-page";
import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Liên hệ công tác",
  description: "Thông tin liên hệ công tác, hợp tác với ZENOS Hobby Store.",
  alternates: { canonical: "/lien-he-cong-tac" },
};

const CONTACT_ROWS: { icon: string; label: string; value: string; href?: string }[] = [
  { icon: "person", label: "Họ và tên", value: BUSINESS_INFO.representative },
  { icon: "location_on", label: "Địa chỉ liên hệ", value: BUSINESS_INFO.address },
  { icon: "call", label: "Số điện thoại", value: BUSINESS_INFO.phone, href: `tel:${BUSINESS_INFO.phone.replace(/\s+/g, "")}` },
  { icon: "mail", label: "Email", value: BUSINESS_INFO.email, href: `mailto:${BUSINESS_INFO.email}` },
  ...(SOCIAL_LINKS.facebook !== "#"
    ? [{ icon: "public", label: "Facebook", value: SOCIAL_LINKS.facebook, href: SOCIAL_LINKS.facebook }]
    : []),
];

export default function BusinessContactPage() {
  return (
    <PolicyPage
      title="Liên hệ công tác"
      intro="Đại diện, đối tác hoặc cơ quan chức năng cần trao đổi công tác với ZENOS Hobby Store vui lòng liên hệ theo thông tin dưới đây."
    >
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md">
        <dl className="space-y-sm">
          {CONTACT_ROWS.map((row) => (
            <div key={row.label} className="flex items-center gap-sm">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                <Icon name={row.icon} />
              </span>
              <div className="min-w-0">
                <dt className="font-label-md text-label-sm text-on-surface-variant">{row.label}</dt>
                {row.href ? (
                  <dd>
                    <a href={row.href} className="font-body-md text-body-md text-on-surface hover:text-primary transition-colors break-words">
                      {row.value}
                    </a>
                  </dd>
                ) : (
                  <dd className="font-body-md text-body-md text-on-surface break-words">{row.value}</dd>
                )}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </PolicyPage>
  );
}
