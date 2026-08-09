import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/business-info";

const CHANNELS: { title: string; description: string; value: string; href: string }[] = [
  {
    title: "Email hỗ trợ",
    description: "Phù hợp với yêu cầu chi tiết, bảo hành và đề nghị hợp tác nội dung.",
    value: BUSINESS_INFO.email,
    href: `mailto:${BUSINESS_INFO.email}`,
  },
  {
    title: "Facebook / Messenger",
    description: "Hỏi nhanh về sản phẩm, phiên bản và tình trạng hàng.",
    value: BUSINESS_INFO.tradeName,
    href: SOCIAL_LINKS.facebook,
  },
  {
    title: "Điện thoại",
    description: "Liên hệ nhanh để xác nhận giá, tình trạng sản phẩm hoặc lịch PRE-ORDER.",
    value: BUSINESS_INFO.phone,
    href: `tel:${BUSINESS_INFO.phone.replace(/\s+/g, "")}`,
  },
];

export function SupportChannelsCard() {
  return (
    <div className="h-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-lg">
      <p className="font-label-sm text-label-sm text-[#ff5a36] font-bold uppercase tracking-widest mb-xs">
        Support channels
      </p>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase mb-md">Kênh liên hệ</h2>

      <ul className="space-y-md">
        {CHANNELS.map((channel, index) => (
          <li key={channel.title} className="flex gap-sm">
            <span className="font-label-sm text-label-sm text-[#ff5a36] font-bold shrink-0 pt-0.5">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface font-bold uppercase mb-1">{channel.title}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs leading-snug">
                {channel.description}
              </p>
              <a
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 font-label-md text-label-md text-[#ff5a36] hover:text-[#e04527] transition-colors break-all"
              >
                {channel.value}
                <Icon name="north_east" className="!text-[14px]" />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-md pt-md border-t border-outline-variant/20">
        <p className="font-label-sm text-label-sm text-on-surface font-bold uppercase mb-xs">Giờ hỗ trợ</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{BUSINESS_INFO.workingHours}</p>
      </div>
    </div>
  );
}
