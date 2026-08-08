import type { ApiProduct } from "@/lib/api-types";
import type { Product, ProductBadge } from "@/lib/types";

const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

const KNOWN_BADGES: ReadonlySet<string> = new Set<ProductBadge>([
  "pre_order",
  "limited",
  "best_seller",
  "new_arrival",
  "exclusive",
  "sold_out",
  "recommended",
]);

function isKnownBadge(value: string): value is ProductBadge {
  return KNOWN_BADGES.has(value);
}

/**
 * Adapts the backend's ApiProduct shape onto the FE's legacy `Product` type
 * so existing display components (ProductCard, ProductGallery, ...) work
 * unchanged against real data. `category` is resolved from `categoryId`
 * via the categories already fetched alongside — never guessed.
 */
export function mapApiProduct(apiProduct: ApiProduct, categoryNameById: ReadonlyMap<string, string>): Product {
  return {
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    brand: apiProduct.brand,
    universe: apiProduct.universe,
    category: apiProduct.categoryId ? (categoryNameById.get(apiProduct.categoryId) ?? "") : "",
    categoryIds: apiProduct.categoryId ? [apiProduct.categoryId] : [],
    scale: apiProduct.scale,
    price: apiProduct.price,
    compareAtPrice: apiProduct.compareAtPrice ?? undefined,
    currency: "VND",
    sellingPrice: apiProduct.sellingPrice ?? undefined,
    originalPrice: apiProduct.originalPrice ?? undefined,
    promoPrice: apiProduct.promoPrice ?? undefined,
    costPrice: apiProduct.costPrice ?? undefined,
    stockStatus: apiProduct.stockStatus,
    stockCount: apiProduct.stockCount,
    badges: apiProduct.badges.filter(isKnownBadge),
    rating: apiProduct.rating,
    reviewCount: apiProduct.reviewCount,
    description: apiProduct.description,
    highlights: apiProduct.highlights,
    specs: apiProduct.specs,
    images: apiProduct.images.length > 0 ? apiProduct.images : [PLACEHOLDER_IMAGE],
    heroImage: apiProduct.heroImage || PLACEHOLDER_IMAGE,
    videos: apiProduct.videos,
  };
}
