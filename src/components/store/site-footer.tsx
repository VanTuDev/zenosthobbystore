import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { BUSINESS_INFO, SOCIAL_LINKS } from "@/lib/business-info";

const ZENOS_LOGO = "/LogoZENOSTHOBBYSTORE.png";

const STORE_LINKS = [
  { label: "Tất cả sản phẩm", href: "/products" },
  { label: "Sản phẩm có sẵn", href: "/products?status=in_stock" },
  { label: "PRE-ORDER", href: "/products?type=pre_order" },
  { label: "Câu hỏi thường gặp", href: "/faq" },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-margin-mobile py-10 md:grid-cols-[minmax(0,1.5fr)_minmax(170px,0.6fr)_minmax(240px,0.8fr)] md:px-margin-desktop md:py-12">
        <div className="w-full max-w-[440px] min-w-0">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Về trang chủ ZENOST">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black shadow-sm transition-transform group-hover:-translate-y-0.5">
              <Image src={ZENOS_LOGO} alt="" width={48} height={48} unoptimized className="h-full w-full object-contain" />
            </span>
            <span className="font-headline-sm text-base font-bold tracking-tight text-on-surface uppercase">
              ZENOST HOBBY STORE
            </span>
          </Link>
          <p className="mt-4 max-w-[380px] font-body-md text-sm leading-6 text-on-surface-variant">
            Khám phá mô hình, giá tham khảo và video thực tế dành cho cộng đồng yêu thích hobby.
          </p>
          <Link
            href="/lien-he"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-on-surface px-4 py-2 font-label-md text-xs font-bold text-surface transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Liên hệ cửa hàng
            <Icon name="arrow_forward" className="!text-[16px]" />
          </Link>
        </div>

        <nav aria-label="Khám phá cửa hàng">
          <h2 className="mb-4 font-label-md text-xs font-bold uppercase tracking-[0.16em] text-on-surface">
            Khám phá
          </h2>
          <div className="flex flex-col items-start gap-3">
            {STORE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-body-md text-sm text-on-surface-variant transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div>
          <h2 className="mb-4 font-label-md text-xs font-bold uppercase tracking-[0.16em] text-on-surface">
            Kết nối
          </h2>
          <div className="space-y-3">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-sm text-on-surface-variant transition-colors hover:text-primary">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Icon name="public" className="!text-[18px]" />
              </span>
              <span>Facebook ZENOST</span>
            </a>
            <a href={`mailto:${BUSINESS_INFO.email}`} className="group flex items-center gap-3 text-sm text-on-surface-variant transition-colors hover:text-primary">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Icon name="mail" className="!text-[18px]" />
              </span>
              <span className="break-all">{BUSINESS_INFO.email}</span>
            </a>
            <a href={`tel:${BUSINESS_INFO.phone}`} className="group flex items-center gap-3 text-sm text-on-surface-variant transition-colors hover:text-primary">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">
                <Icon name="call" className="!text-[18px]" />
              </span>
              <span>{BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
