export type StockStatus = "in_stock" | "pre_order" | "sold_out" | "coming_soon";

export type ProductBadge =
  | "pre_order"
  | "limited"
  | "best_seller"
  | "new_arrival"
  | "exclusive"
  | "sold_out"
  | "recommended";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  universe: string;
  category: string;
  /** All category ids this product is assigned to (admin-created products may have several). */
  categoryIds?: string[];
  scale: string;
  price: number;
  compareAtPrice?: number;
  currency: "VND";
  /** Everyday selling price before any promotion is applied. */
  sellingPrice?: number;
  /** MSRP / list price, shown struck through when higher than the selling price. */
  originalPrice?: number;
  /** Temporary promotional price, when the product is on a limited-time sale. */
  promoPrice?: number;
  /** Internal cost price — admin-only, never rendered on customer-facing pages. */
  costPrice?: number;
  stockStatus: StockStatus;
  stockCount: number;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  images: string[];
  heroImage: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: string;
  status: "active" | "hidden";
  description: string;
  /** Optional parent category id, used to build a nested tree (e.g. Gundam -> Master Grade). */
  parentId?: string;
  /** Folders this category is grouped under (a category can belong to more than one folder). */
  folderIds?: string[];
};

/**
 * Top-level grouping above Category, e.g. folder "Anime" containing
 * categories "Naruto", "Pokemon", "One Piece". A category may belong to
 * several folders (Pokemon can live under both "Anime" and "Thẻ bài").
 */
export type Folder = {
  id: string;
  name: string;
  slug: string;
};

/** Mirrors the `toPublicUser()` shape returned by the backend's /auth/* routes. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  avatarUrl: string | null;
  initials: string;
};

export type FinanceTransaction = {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  type: "revenue" | "refund" | "payout";
  method: "Chuyển khoản" | "COD" | "Thẻ tín dụng" | "Ví điện tử";
  status: "completed" | "pending" | "failed";
};
