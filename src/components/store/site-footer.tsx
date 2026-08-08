import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, ZENOS_MARK_SVG } from "@/lib/business-info";

const FOOTER_COLUMNS = [
  {
    title: "Cửa hàng",
    links: [
      { label: "Đặt trước", href: "/products?status=pre_order" },
      { label: "Hàng mới về", href: "/products?badge=new_arrival" },
      { label: "Kho hàng hiếm", href: "/products?badge=limited" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
      { label: "Chính sách đổi trả & bảo hành", href: "/chinh-sach-doi-tra" },
      { label: "Chính sách thanh toán", href: "/chinh-sach-thanh-toan" },
      { label: "Cam kết chính hãng", href: "/cam-ket-chinh-hang" },
      { label: "Hobby FAQ", href: "/faq" },
      { label: "Liên hệ", href: "/lien-he" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Giới thiệu & thông tin doanh nghiệp", href: "/gioi-thieu" },
      { label: "Liên hệ công tác", href: "/lien-he-cong-tac" },
      { label: "Quyền riêng tư", href: "/quyen-rieng-tu" },
      { label: "Điều khoản dịch vụ", href: "/dieu-khoan" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low w-full">
      <div className="flex flex-col md:flex-row justify-between items-start px-margin-mobile md:px-margin-desktop py-lg gap-lg w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-sm max-w-96">
          <Link href="/" className="flex items-center gap-xs">
            <Image src={ZENOS_MARK_SVG} alt="ZENOST Logo" width={24} height={24} unoptimized className="w-6 h-6 object-contain" />
            <span className="font-headline-sm text-label-md font-bold text-on-surface uppercase">
              ZENOST
            </span>
          </Link>
          <p className="text-secondary font-label-sm text-label-sm leading-snug">
            Điểm đến cho những người chơi hobby chuyên nghiệp.
          </p>
          <div className="flex gap-sm text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#" aria-label="Website">
              <Icon name="public" className="!text-[18px]" />
            </a>
            <a className="hover:text-primary transition-colors" href="#" aria-label="Mạng xã hội">
              <Icon name="share" className="!text-[18px]" />
            </a>
            <a className="hover:text-primary transition-colors" href="#" aria-label="Email">
              <Icon name="mail" className="!text-[18px]" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} className="flex flex-col gap-xs" aria-label={col.title}>
              <h2 className="font-label-sm text-label-sm text-on-surface font-bold uppercase">
                {col.title}
              </h2>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="px-margin-mobile md:px-margin-desktop py-sm border-t border-outline-variant/30 text-center md:text-left">
        <p className="font-label-sm text-[11px] text-secondary">
          © {new Date().getFullYear()} {BUSINESS_INFO.tradeName} · {BUSINESS_INFO.legalName} · MST/GCN ĐKHKD:{" "}
          {BUSINESS_INFO.registrationNumber} · {BUSINESS_INFO.address}
        </p>
      </div>
    </footer>
  );
}
