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
        className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-base max-w-[1440px] mx-auto"
      >
        <Link href="/" className="flex items-center gap-base" aria-label="Về trang chủ ZENOST">
          <Image
            src={ZENOS_LOGO}
            alt="ZENOST Logo"
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 object-contain"
            priority
          />
          <span className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">
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
        <div className="flex items-center gap-md">
          <SiteSearch />
          <WishlistNavLink />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
