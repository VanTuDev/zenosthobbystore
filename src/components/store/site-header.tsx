import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/store/user-menu";
import { WishlistNavLink } from "@/components/store/wishlist-nav-link";
import { SiteSearch } from "@/components/store/site-search";

const ZENOS_LOGO = "/LogoZENOSTHOBBYSTORE.png";

const NAV_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "PRE-ORDER", href: "/products?status=pre_order" },
  { label: "Liên Hệ", href: "/lien-he" },
  { label: "FAQ", href: "/faq" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm">
      <nav
        aria-label="Điều hướng chính"
        className="flex min-w-0 items-center justify-between gap-3 px-margin-mobile py-3 md:px-margin-desktop md:py-base max-w-[1440px] mx-auto"
      >
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-base" aria-label="Về trang chủ ZENOST">
          <Image
            src={ZENOS_LOGO}
            alt="ZENOST Logo"
            width={40}
            height={40}
            unoptimized
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="hidden font-headline-md text-headline-md font-bold tracking-tighter text-on-surface sm:block">
            ZENOST HOBBY STORE
          </span>
        </Link>
        <ul className="hidden md:flex items-center gap-lg">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-3 sm:gap-md">
          <SiteSearch />
          <WishlistNavLink />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
