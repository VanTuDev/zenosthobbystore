import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "./_components/product-gallery";
import { ProductCtaButtons } from "./_components/product-cta-buttons";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Reveal } from "@/components/ui/reveal";
import { RecentlyViewedSection } from "./_components/recently-viewed-section";
import { StockNotifyForm } from "./_components/stock-notify-form";
import { formatVnd } from "@/lib/format";
import { fetchProductBySlug, fetchProducts } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { mapApiProduct } from "@/lib/api/map-product";
import { ApiRequestError } from "@/lib/api-client";
import type { StockStatus } from "@/lib/types";

const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  pre_order: "Đặt trước",
  sold_out: "Hết hàng",
  coming_soon: "Sắp ra mắt",
};

const SCHEMA_AVAILABILITY: Record<StockStatus, string> = {
  in_stock: "https://schema.org/InStock",
  pre_order: "https://schema.org/PreOrder",
  sold_out: "https://schema.org/OutOfStock",
  coming_soon: "https://schema.org/PreOrder",
};

const MOCK_REVIEWS = [
  {
    initials: "AR",
    name: "Anh Rồng.",
    timeAgo: "2 ngày trước",
    title: "Chi tiết không thể tin nổi",
    body: "Màu sơn hoàn thiện vượt xa các bản trước đây. Zenos đóng gói cực kỳ cẩn thận với 2 lớp hộp, mình là người sưu tầm giữ box nên rất hài lòng.",
  },
  {
    initials: "HT",
    name: "Huyền Trang",
    timeAgo: "1 tuần trước",
    title: "Tư thế hoàn hảo",
    body: "Tư thế động nhìn thực tế đẹp hơn trong ảnh nhiều. Đóng gói chắc chắn, giao hàng nhanh. Rất đáng tiền!",
  },
];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Product data is admin-managed and changes often, so this route renders
 * dynamically per request rather than via generateStaticParams — no static
 * snapshot of the catalog to keep in sync with the backend.
 */

async function loadProduct(slug: string) {
  try {
    const { product } = await fetchProductBySlug(slug);
    return product;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  return {
    title: `${product.name} | ZENOS Hobby Store`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.heroImage ? [product.heroImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [apiProduct, categories] = await Promise.all([loadProduct(slug), fetchCategories()]);

  if (!apiProduct) {
    notFound();
  }

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const product = mapApiProduct(apiProduct, categoryNameById);

  const relatedResponse = apiProduct.categoryId
    ? await fetchProducts({ categoryIds: [apiProduct.categoryId], pageSize: 5 })
    : null;
  const relatedProducts = (relatedResponse?.items ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => mapApiProduct(p, categoryNameById));

  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;
  const isPreOrder = product.stockStatus === "pre_order" || product.stockStatus === "coming_soon";
  const isSoldOut = product.stockStatus === "sold_out";
  const filledStars = Math.round(product.rating);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: SCHEMA_AVAILABILITY[product.stockStatus],
      url: `https://zenoshobbystore.vn/products/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://zenoshobbystore.vn/" },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: "https://zenoshobbystore.vn/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://zenoshobbystore.vn/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="pt-28 pb-xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: product.category, href: "/products" },
            { label: product.name },
          ]}
        />

        {/* Product shell */}
        <div className="flex flex-col lg:flex-row gap-xl items-start">
          <ProductGallery
            images={product.images}
            name={product.name}
            badgeLabel={isPreOrder ? "Pre-order" : undefined}
          />

          {/* Right: Product info & CTAs */}
          <div className="w-full lg:w-[35%] flex flex-col">
            <div className="mb-6">
              <p className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2">
                Nhà sản xuất: {product.brand}
              </p>
              <h1 className="font-display-lg text-display-lg-mobile md:text-[40px] text-on-surface leading-tight mb-2">
                {product.name}
              </h1>
              <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
                {product.category}
                {product.scale !== "Không tỷ lệ" ? ` ${product.scale}` : ""} | {product.universe}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-primary" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" filled={i < filledStars} className="text-[18px]" />
                ))}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                ({product.reviewCount} đánh giá)
              </span>
            </div>

            <div className="mb-8 py-6 border-y border-surface-container-highest">
              <div className="flex items-baseline gap-md mb-2 flex-wrap">
                <span className="font-display-lg text-[36px] text-on-surface">
                  {formatVnd(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="font-body-md text-body-md text-on-surface-variant line-through">
                    {formatVnd(product.compareAtPrice)}
                  </span>
                )}
                {discountPercent !== null && (
                  <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-label-md text-label-sm">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <p
                className={`font-label-md text-label-md flex items-center gap-1 ${
                  isSoldOut ? "text-outline" : isPreOrder ? "text-tertiary" : "text-primary"
                }`}
              >
                <Icon name={isPreOrder ? "calendar_today" : "inventory_2"} className="text-[18px]" />
                {isSoldOut
                  ? STOCK_LABEL.sold_out.toUpperCase()
                  : isPreOrder
                    ? "DỰ KIẾN PHÁT HÀNH: SẮP CẬP NHẬT"
                    : `CÒN ${product.stockCount} SẢN PHẨM`}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wider">
                Mô tả sản phẩm
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
              {product.highlights.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                      <Icon name="check_circle" className="text-primary text-[18px] mt-0.5" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CTAs */}
            <ProductCtaButtons productId={product.id} isPreOrder={isPreOrder} isSoldOut={isSoldOut} />

            {isSoldOut && <StockNotifyForm productName={product.name} />}

            {/* Trust badges */}
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest/50 flex items-start gap-4">
                <Icon name="verified" className="text-primary text-[28px]" />
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface font-bold uppercase">
                    Cam kết chính hãng 100%
                  </p>
                  <p className="font-body-md text-[13px] text-on-surface-variant">
                    Sản phẩm được nhập khẩu trực tiếp từ {product.brand}. Full box, nguyên seal.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest/50 flex items-start gap-4">
                <Icon name="local_shipping" className="text-primary text-[28px]" />
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface font-bold uppercase">
                    Giao hàng &amp; Bảo quản
                  </p>
                  <p className="font-body-md text-[13px] text-on-surface-variant">
                    Đóng gói 2 lớp hộp chống sốc chuyên dụng. Miễn phí vận chuyển cho đơn hàng đặt
                    trước.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specification section */}
        {product.specs.length > 0 && (
          <Reveal>
            <section className="mt-24 p-xl bg-white rounded-3xl premium-shadow border border-surface-container-highest/30">
              <h2 className="font-display-lg text-headline-md md:text-headline-md text-on-surface mb-8 border-b border-surface-container-highest pb-4">
                Thông số kỹ thuật
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex flex-col gap-1">
                    <dt className="text-on-surface-variant font-label-sm uppercase tracking-widest">
                      {spec.label}
                    </dt>
                    <dd className="text-on-surface font-headline-sm">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        )}

        {/* Reviews section */}
        <section className="mt-24">
          <Reveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                  Đánh giá từ cộng đồng
                </h2>
                <p className="text-on-surface-variant mt-2">
                  Chia sẻ trải nghiệm sưu tầm của bạn cùng Zenos
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl premium-shadow border border-surface-container-highest">
                <div className="text-center border-r border-surface-container-highest pr-4">
                  <span className="block font-display-lg text-3xl text-on-surface">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-label-sm text-on-surface-variant uppercase">Trung bình</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-primary" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" filled={i < filledStars} />
                    ))}
                  </div>
                  <span className="text-label-sm text-on-surface-variant">
                    Dựa trên {product.reviewCount} lượt mua
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {MOCK_REVIEWS.map((review, i) => (
              <Reveal key={review.name} delay={i * 100}>
                <article className="flex flex-col gap-4 p-8 rounded-3xl bg-white premium-shadow border border-surface-container-highest/30 transition-shadow duration-300 hover:shadow-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
                        aria-hidden="true"
                      >
                        {review.initials}
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">{review.name}</p>
                        <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                          <Icon name="verified_user" filled className="text-[14px] text-primary" />
                          Đã mua hàng
                        </p>
                      </div>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{review.timeAgo}</span>
                  </div>
                  <div className="flex text-primary" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" filled className="text-[18px]" />
                    ))}
                  </div>
                  <p className="font-label-md text-on-surface">&quot;{review.title}&quot;</p>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">{review.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <button
            type="button"
            className="mx-auto mt-12 px-8 py-3 border-2 border-primary text-primary font-label-md rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all flex items-center gap-2"
          >
            Xem thêm đánh giá
            <Icon name="expand_more" />
          </button>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                    Sản phẩm tương tự
                  </h2>
                  <p className="text-on-surface-variant mt-2">
                    Gợi ý hoàn thiện bộ sưu tập của bạn
                  </p>
                </div>
                <Link
                  href="/products"
                  className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 mb-2"
                >
                  Xem tất cả
                  <Icon name="arrow_forward" className="text-[18px]" />
                </Link>
              </div>
            </Reveal>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {relatedProducts.map((related, i) => (
                <li key={related.id}>
                  <Reveal delay={(i % 4) * 80}>
                    <ProductCard product={related} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RecentlyViewedSection currentSlug={product.slug} />
      </div>
    </div>
  );
}
