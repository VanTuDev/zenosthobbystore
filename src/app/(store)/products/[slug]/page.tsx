import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailShell } from "./_components/product-detail-shell";
import { VideoShowcaseSection } from "./_components/video-showcase-section";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { Reveal } from "@/components/ui/reveal";
import { RecentlyViewedSection } from "./_components/recently-viewed-section";
import { fetchProductBySlug, fetchProducts } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";
import { mapApiProduct } from "@/lib/api/map-product";
import { ApiRequestError } from "@/lib/api-client";
import type { StockStatus } from "@/lib/types";

const SCHEMA_AVAILABILITY: Record<StockStatus, string> = {
  in_stock: "https://schema.org/InStock",
  pre_order: "https://schema.org/PreOrder",
  sold_out: "https://schema.org/OutOfStock",
  coming_soon: "https://schema.org/PreOrder",
};

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
    title: `${product.name} | ZENOST Hobby Store`,
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
      url: `https://zenosthobbystore.com/products/${product.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://zenosthobbystore.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: "https://zenosthobbystore.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://zenosthobbystore.com/products/${product.slug}`,
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
        <ProductDetailShell
          product={product}
          isPreOrder={isPreOrder}
          isSoldOut={isSoldOut}
          discountPercent={discountPercent}
        />

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

        {/* Video showcase — every video for this product, above Related products */}
        <VideoShowcaseSection videos={product.videos} name={product.name} />

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
