import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalogClient } from "./_components/product-catalog-client";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProductFacets } from "@/lib/api/products";

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `Kết quả tìm kiếm cho "${q}"`,
      description: `Sản phẩm mô hình anime phù hợp với từ khóa "${q}" tại ZENOS Hobby Store.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: "Mô hình Scale | Danh mục sản phẩm",
    description:
      "Khám phá bộ sưu tập mô hình PVC và ABS độ chi tiết cao được tuyển chọn tại ZENOS Hobby Store. Mỗi sản phẩm đều được xác thực và kiểm định cho những nhà sưu tầm sành sỏi.",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductCatalogPage() {
  const [categories, facets] = await Promise.all([fetchCategories(), fetchProductFacets()]);

  return (
    <Suspense fallback={null}>
      <ProductCatalogClient categories={categories} facets={facets} />
    </Suspense>
  );
}
