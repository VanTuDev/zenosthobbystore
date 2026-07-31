import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/store/user-menu";
import { WishlistNavLink } from "@/components/store/wishlist-nav-link";
import { CartNavLink } from "@/components/store/cart-nav-link";
import { SiteSearch } from "@/components/store/site-search";

const ZENOS_LOGO = "/LogoZENOSTHOBBYSTORE.jpg";

const NAV_LINKS = [
  { label: "Sản phẩm có sẵn", href: "/products?status=in_stock" },
  { label: "Đặt hàng trước", href: "/products?status=pre_order" },
  { label: "Giao hàng - Bảo hành", href: "/giao-hang-bao-hanh" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-sm">
      <nav
        aria-label="Điều hướng chính"
        className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-base max-w-[1440px] mx-auto"
      >
        <Link href="/" className="flex items-center gap-base" aria-label="Về trang chủ ZENOS">
          <Image
            src={ZENOS_LOGO}
            alt="ZENOS Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
            priority
          />
          <span className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">
            ZENOS
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
          <CartNavLink />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
