import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/store/product-card";
import { formatVnd } from "@/lib/format";
import { fetchProducts } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { mapApiProduct } from "@/lib/api/map-product";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Phòng Trưng Bày Mô Hình Anime Tuyển Chọn",
  description:
    "ZENOST - phòng trưng bày mô hình anime cao cấp: Pokemon, Gundam, Naruto. Tuyển chọn statue và figure hiếm cho nhà sưu tập sành sỏi, nhập khẩu chính hãng.",
  alternates: { canonical: "/" },
};

/**
 * Rendered per-request instead of prerendered at build time: the catalog changes live via the
 * admin CMS, so a static build would go stale, and `next build` would otherwise hard-fail
 * whenever the backend isn't reachable at build time (e.g. deploying frontend/backend separately).
 */
export const dynamic = "force-dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: BUSINESS_INFO.tradeName,
  description:
    "Phòng trưng bày mô hình anime cao cấp: Pokemon, Gundam, Naruto, statue và figure sưu tầm.",
  url: "https://zenosthobbystore.com",
};

export default async function HomePage() {
  const [categories, productsResponse] = await Promise.all([
    fetchCategories(),
    fetchProducts({ pageSize: 8, sort: "moi-nhap" }),
  ]);
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const featuredProducts = productsResponse.items.map((p) => mapApiProduct(p, categoryNameById));
  const [spotlightA, spotlightB] = featuredProducts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-screen min-h-[640px] flex flex-col items-center justify-center pt-xl overflow-hidden bg-on-surface">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvwQ0f86ZUBeXffdd5itRCijimyP9QYcccuAser2hE3-IN12KM9eCRy1-c-i5PtpfAAU-knVEC7W0_-bojhggh3lhObxhuoUVuCAtOpcQDGoUF0CXkyz8a3yKVS-W0-BDvYn5znYCgKTqIsuomBAvef_onZzmmdpi3NMHF6mfWIKqtvJqB9cXInkeR43dysgF9Ib3Ez2mA-K-slydemNGaSxuHD0f0rMgL3f5QdSp3_frw2AkGRgVDx0A3gSjksovRy1_dcOuIdjY"
            alt="Phòng trưng bày mô hình anime cao cấp phong cách gallery tối giản"
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover"
          />
          {/* Scrim: darkens the photo so hero copy stays readable regardless of what's behind it */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-surface" />
        </div>
        <div className="relative z-10 text-center px-margin-mobile">
          <Reveal delay={100}>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-base tracking-tighter uppercase text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
              Phòng Trưng Bày Đam Mê
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto mb-lg drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              Tuyển chọn những mô hình anime hiếm và được săn đón nhất thế giới trong một không
              gian tinh tế và đẳng cấp dành cho những nhà sưu tập sành sỏi.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="flex flex-col sm:flex-row gap-base justify-center">
              <Button href="/products">Khám Phá Bộ Sưu Tập</Button>
              <Button
                href="/products?sort=moi-nhap"
                variant="secondary"
                className="!border-white !text-white hover:!bg-white hover:!text-on-surface"
              >
                Sản Phẩm Mới
              </Button>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-xs text-white/70">
          <span className="font-label-sm text-label-sm uppercase tracking-widest">
            Cuộn để khám phá
          </span>
          <span className="animate-soft-bounce">
            <Icon name="keyboard_arrow_down" />
          </span>
        </div>
      </section>

      {/* Category bento grid */}
      <section className="px-margin-mobile md:px-margin-desktop py-xl max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-auto md:h-[600px]">
          <Reveal className="md:col-span-2 h-full" delay={0}>
            <Link
              href="/products?type=pre_order"
              className="group relative block h-full min-h-[280px] overflow-hidden rounded-xl bg-surface-container-low"
            >
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj_VtrYxpfkUxmNxnreA8SSullKepaUw_6kErmPsyH3wG295ukLmvBoshOA_vNBAOaB2hqbxwvvO-M38ie14ACLzUJj1Gdm3UtY5HhqEJCcIi6Sey809haGeNiVs1Mp59pC79_Fc05p-KQAUxKy5PBstSfYSg0oEfi-z8OULBFY5bGMSKCc4YVqeT_LjlX6corhC983gJM3eFKnjTWrZSpiMwCFGdDp3r7qH9Tn1iFPRFJNc9MboWB-rTzd_0fmOa-g4qRXhaDKEc"
                alt="Mô hình anime tỉ lệ 1/7 cao cấp đang được mở hộp trong studio"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-md left-md">
                <span className="bg-primary text-on-primary px-sm py-xs rounded font-label-sm text-label-sm uppercase mb-base inline-block">
                  Sắp Mở Bán
                </span>
                <h2 className="font-headline-md text-headline-md text-surface font-bold">
                  Đặt Trước Giới Hạn
                </h2>
                <p className="text-surface-variant font-body-md">
                  Giữ chỗ cho những siêu phẩm sắp ra mắt.
                </p>
              </div>
              <span className="absolute top-md right-md bg-surface/20 backdrop-blur-md text-surface p-base rounded-full group-hover:bg-surface group-hover:text-on-surface transition-all">
                <Icon name="arrow_forward" />
              </span>
            </Link>
          </Reveal>

          <div className="flex flex-col gap-gutter h-full">
            <Reveal delay={140} className="flex-1">
              <Link
                href="/products?badge=best_seller"
                className="group relative block h-full min-h-[130px] overflow-hidden rounded-xl bg-surface-container-low"
              >
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzbvCnonCCZp5orRaR-eBrchBv7rAxNs_NhGvXTuK-Qa5QfZKM_tSBg7CB8VsjavujhanFgip6niVlzDeFsgqwp7gjLnotwPiv-9167M16IvwTDhIPTIkaeXqJP4E5vcS2eij_bskwQWOnnxqUDQJioIexGTRQ_dZdly5evQbjhE_9fkpp9I_b6ntHVaGKj5R9pSZiI5Cc_l9Xhg82WykZ8YTREfZyVuLn6Yk5EQ0Ugp1izKMEG1F49sYCoeRkVupq_USCVpgn1l0"
                  alt="Mô hình Gundam lắp ráp bán chạy nhất với chi tiết cơ khí sắc nét"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="font-headline-sm text-headline-sm text-surface font-bold text-center">
                    Bán Chạy Nhất
                  </h2>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={220} className="flex-1">
              <Link
                href="/products?badge=limited"
                className="group relative block h-full min-h-[130px] overflow-hidden rounded-xl bg-surface-container-low"
              >
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdgqf4eyHdU6mqLSGczR7NSniVNNKSyrXA_iy8jT11Qrtx7nyVsz-SdYN5SgKKS-70DDfIsfY_f0zcdCaLyGgbq-KYTeBl9NLCJWfLPqsRDElfkFJmcSqSPeOf9bZAQgwK8VvZIkd3ob3ZDMZaojIWX84D79r36m7-DL9pHPZS8OOM3CbHIb45l1hc1OQVk7rB2-nOnayZeGV6O_RqKLWQeNooUUpovbVp0x-ReJw75BTth0ijarDG2k2RXU6r8KLVxV1z_vH3LSc"
                  alt="Bộ sưu tập Nendoroid hiếm được trưng bày trong tủ kính tối giản"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="font-headline-sm text-headline-sm text-surface font-bold text-center">
                    Kho Lưu Trữ Hiếm
                  </h2>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="px-margin-mobile md:px-margin-desktop py-xl max-w-[1440px] mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-base mb-lg">
            <div>
              <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-sm block">
                Tuyển chọn hôm nay
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tighter">
                Bộ Sưu Tập Nổi Bật
              </h2>
            </div>
            <Button
              href="/products"
              variant="ghost"
              className="!px-0 !py-0 self-start md:self-auto"
            >
              Xem thêm sản phẩm
              <Icon name="arrow_forward" className="!text-[18px]" />
            </Button>
          </div>
        </Reveal>
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 100} className="h-full">
              <li className="list-none h-full">
                <ProductCard product={product} />
              </li>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-lg flex justify-center">
          <Button href="/products" variant="dark">
            Xem thêm sản phẩm
            <Icon name="arrow_forward" className="!text-[18px]" />
          </Button>
        </Reveal>
      </section>

      {/* Spotlight: two hero picks from the current catalog */}
      <section className="relative py-xl bg-surface overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto grid md:grid-cols-2 gap-xl items-center">
          <Reveal from="left">
            <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-sm block">
              Tuyển chọn nổi bật
            </span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-md tracking-tighter">
              Kiệt Tác Đáng Sưu Tầm
            </h2>
            <p className="text-secondary font-body-lg mb-lg">
              Từ những bản sao tỉ lệ siêu thực đến các mô hình lắp ráp độ chi tiết cao, mỗi sản
              phẩm tại ZENOST đều được tuyển chọn và kiểm định cho những nhà sưu tầm sành sỏi.
            </p>
            <div className="grid grid-cols-2 gap-md">
              {[spotlightA, spotlightB].filter((p) => p !== undefined).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="p-md bg-white rounded-lg shadow-sm hover-glow transition-all"
                >
                  <div className="relative w-full aspect-square mb-base">
                    <Image
                      src={p.heroImage}
                      alt={p.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-label-md text-label-md">{p.name}</h3>
                  <p className="text-primary font-bold">{formatVnd(p.price)}</p>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal from="right" delay={150}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqgDcS3xEDNEr2BqM2nvUFgJFGlUBwvv_IHsnMfPdVo_zNpKQvDkdbbj1_6h5bU9rRx8rIFOluKNt4l4Se_4iFycL3cnSY4JhNBJkk4WQ2IXifGI01D2EHXFDGNSd5IRWY1u4TJoo7QAupzqOGjIEcTXoKLhCYddQ9oyex4ktihf0-j2zoFDK90l24vq_xtAENwZdq7dM--8PTqODE1P4Qowa-FD-kjZmnefzE0JMMyhKUOGobXpvYhxDzZwxpdcf9j78IBWMNjf8"
              alt="Tượng Mewtwo cao cấp"
              width={720}
              height={900}
              className="w-full rounded-2xl shadow-xl"
            />
          </Reveal>
        </div>
      </section>

      {/* Universe: Gundam */}
      <section className="relative py-xl bg-surface-container-low overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto flex flex-col md:flex-row-reverse gap-xl items-center">
          <Reveal from="right" className="md:w-1/2">
            <span className="font-label-md text-label-md text-tertiary uppercase tracking-[0.2em] mb-sm block">
              Bậc thầy Cơ khí
            </span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-md tracking-tighter">
              Perfect Grade
            </h2>
            <p className="text-secondary font-body-lg mb-lg">
              Trải nghiệm đỉnh cao kỹ thuật với tuyển tập Master Grade và Perfect Grade được chọn
              lọc. Sự chính xác hiện hữu trong từng đường kẻ viền (panel line).
            </p>
            <ul className="space-y-base mb-lg">
              {[
                "Nhập khẩu chính hãng Bandai Spirits",
                "Bộ Decal tùy chỉnh độc quyền",
                "Tặng kèm hộp trưng bày cao cấp",
              ].map((item) => (
                <li key={item} className="flex items-center gap-sm font-label-md">
                  <Icon name="check_circle" className="text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/products?category=gunpla" variant="dark">
              Xem Tất Cả Mecha
            </Button>
          </Reveal>
          <Reveal from="left" delay={150} className="md:w-1/2 relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuF9qZVyDLyWmEcQ_t2D4XF9D4AIx13-KHTWoRQNLyLDjcDqkpxtCxucFlkZyW8KVKN_TqivI-l-4luLTIDF4SUQoBFVEHxuwpuuNLJzhbHQJgj6xiVY5Ep2r85IVCmQS4xkA5ZI_WfdoWN2ysO-MEPn7mgBXw3MGmPL6ceke-6MqoDuC8csHehnN6iOHlTIzROBVVI-Ie7z_HEVF-EADS0ktikWTdxGIivAVuMdwqzx_DenBw48MM5G7fbgpsJS9ke13VPVe9oNM"
              alt="Cận cảnh đầu mô hình Gundam RX-78-2"
              width={720}
              height={900}
              className="w-full rounded-2xl shadow-2xl"
            />
          </Reveal>
        </div>
      </section>

      {/* Universe: Naruto */}
      <section className="relative py-xl bg-surface overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto grid md:grid-cols-2 gap-xl items-center">
          <Reveal from="left">
            <span className="font-label-md text-label-md text-on-tertiary-fixed-variant uppercase tracking-[0.2em] mb-sm block">
              Hỏa chí
            </span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-md tracking-tighter">
              Nghệ Nhân Làng Lá
            </h2>
            <p className="text-secondary font-body-lg mb-lg">
              Ghi lại những cảm xúc sâu sắc của thế giới Nhẫn Giả qua các vật phẩm sưu tầm cao
              cấp. Mỗi mô hình là một minh chứng cho di sản của nhân vật.
            </p>
            <div className="grid grid-cols-2 gap-md">
              <div className="aspect-square relative rounded-xl overflow-hidden group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-M3ZzuTrG4PXY2WnzM3S0dsif9Cd8161-dXwogwk1ftLogPOkzSwlaUsoJTKMmi--BnBHmFsspuCsWuo6oscUIeFEhkIkA3dfCMGvyeYEK4AIjbFLdUc6K7W4oNeDAc-XMadvXqFFF7tEbFWlzDU2tAsEksPVg4ZC4yxdl-RmmepqTHAafzosLm7Ldt4eg_C9gh9fn4VP8HAtOsXT4Va2H8ExeWZZq2cnv926wQr3hM2P_dWDg9Qx63J4fQtZ7F-rN-h2bFnqwSY"
                  alt="Mô hình Naruto Chế Độ Hiền Nhân"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-base">
                  <p className="text-surface font-label-md">Naruto: Sage Mode</p>
                  <p className="text-surface-variant text-label-sm">Phiên Bản Giới Hạn</p>
                </div>
              </div>
              <div className="aspect-square relative rounded-xl overflow-hidden group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlcosw1dTfVrUzxQTj1ITC4zSxR5PElKUK3sTdC_6MuJOzwU-BQCjhPmuOHsm02cECdKx3W9_dtQY7Z614eveccGldfrht3q2TTfOST_kq5tykFfpXycKeF7qoUoANwRdTrPM1rQ8pRPrAbyA99qLyTXL7oFH1dzh7hdWi_OfpwxAjf4Zfi3yFFlqkfq_NVwdzd4Dh-YbFBtfiXfzX_RJhWiQH42TKoaaNHojF2wBMyTcszgde8vFwGyMme-ieK5cM2azJjnMk9Bc"
                  alt="Mô hình Sasuke Susanoo"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-base">
                  <p className="text-surface font-label-md">Sasuke: Susanoo</p>
                  <p className="text-surface-variant text-label-sm">Sẵn Hàng</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal from="right" delay={150}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVcHL9Ulcs17ajbeUIKB4-YvYNZqkF2A6pBaYakVs0l01bb4BBcltv-heXyGHVjp0PP245ONDaKXXaeBMJ-W9VYIE9F1kgRlhDjoq2uOJD6GQhYsbabEkhvtznvGK-lLSvc--r2VNTJoCwwN47iack4q3HjJ7VYJ9antQNGzD0dW2qqKvCsf-cn_mKRIyX9en2ua90ynKLgrMStW6ldClchybmHcMpPB12P_VTrjSiHWNV5jixe7hSHCkfBNzQ5jKMVezX5COX9Q8"
              alt="Bộ trưng bày các nhân vật Naruto"
              width={720}
              height={900}
              className="w-full rounded-2xl shadow-xl"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
