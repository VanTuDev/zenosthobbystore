import type { StockStatus } from "@/lib/types";

/** Mirrors ProductDoc#toJSON() from Backend-zenosthobbystore/src/models/product.model.ts */
export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  universe: string;
  scale: string;
  price: number;
  compareAtPrice: number | null;
  sellingPrice: number | null;
  originalPrice: number | null;
  promoPrice: number | null;
  costPrice: number | null;
  stockStatus: StockStatus;
  stockCount: number;
  badges: string[];
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  images: string[];
  heroImage: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Mirrors CategoryDoc#toJSON() + the `productCount` the /categories route joins in. */
export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "hidden";
  description: string;
  image: string;
  parentId: string | null;
  folderIds: string[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Mirrors UserDoc#toJSON() from Backend-zenosthobbystore/src/models/user.model.ts */
export type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  updatedAt: string;
};

/** Mirrors ProvinceDoc#toJSON() from Backend-zenosthobbystore/src/models/province.model.ts */
export type ApiProvince = { id: string; code: string; name: string; fullName: string; codeName: string };

/** Mirrors WardDoc#toJSON() from Backend-zenosthobbystore/src/models/ward.model.ts */
export type ApiWard = {
  id: string;
  code: string;
  name: string;
  fullName: string;
  codeName: string;
  provinceCode: string;
};

export type PaginationMeta = { page: number; pageSize: number; total: number; totalPages: number };

export type PaginatedResponse<T> = { items: T[]; pagination: PaginationMeta };

/** Mirrors the response of GET /products/facets. */
export type ProductFacets = {
  brands: { value: string; count: number }[];
  scales: { value: string; count: number }[];
};

/** Mirrors CustomerDoc#toJSON() from src/models/customer.model.ts */
export type ApiCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: "Đồng" | "Bạc" | "Vàng" | "Kim Cương";
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string | null;
  status: "active" | "vip" | "inactive";
};

/** Mirrors PromotionDoc#toJSON() from src/models/promotion.model.ts */
export type ApiPromotion = {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "bundle";
  value: number;
  appliesTo: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  usageCount: number;
  usageLimit: number;
  createdAt: string;
  updatedAt: string;
};

/** Mirrors OrderDoc#toJSON() from src/models/order.model.ts */
export type ApiOrderItem = {
  productId: string | null;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type ApiOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
  shippingAddress: string;
  items: ApiOrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number | null;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "Chuyển khoản" | "COD" | "Thẻ tín dụng" | "Ví điện tử";
  paymentStatus: "paid" | "unpaid" | "refunded";
  placedAt: string;
  userId: string | null;
  promotionCode: string | null;
  promotionId: string | null;
  paymentProvider: "payos" | null;
  paymentRef: string | null;
  paidAt: string | null;
};

/** Mirrors FinanceTransactionDoc#toJSON() from src/models/finance-transaction.model.ts */
export type ApiFinanceTransaction = {
  id: string;
  customer: string;
  date: string;
  amount: number;
  type: "revenue" | "refund" | "payout";
  method: string;
  status: "completed" | "pending" | "failed";
  orderId: string | null;
};

export type FinanceSummary = { revenue: number; refunds: number; payouts: number; net: number };

/** Mirrors the response of GET /finance/stats. */
export type FinanceStats = {
  days: number;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: ApiOrder["status"]; count: number }[];
  topProducts: { productId: string; name: string; image: string; quantity: number; revenue: number }[];
  totals: { totalOrders: number; totalRevenue: number; totalCustomers: number; aov: number };
};

/** Mirrors the response of POST /payments/payos/:orderId. */
export type PayosPaymentSession = { orderId: string; paymentRef: string; amount: number; qrPayload: string };

/** Mirrors ReviewDoc#toJSON() from Backend-zenosthobbystore/src/models/review.model.ts */
export type ApiReview = {
  id: string;
  productId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};
