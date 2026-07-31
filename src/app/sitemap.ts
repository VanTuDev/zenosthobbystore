import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/api/products";

const BASE_URL = "https://zenoshobbystore.vn";
const PAGE_SIZE = 100;

async function fetchAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetchProducts({ page, pageSize: PAGE_SIZE });
    slugs.push(...res.items.map((p) => p.slug));
    totalPages = res.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/chinh-sach-giao-hang`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/chinh-sach-doi-tra`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/chinh-sach-thanh-toan`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/cam-ket-chinh-hang`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/gioi-thieu`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/quyen-rieng-tu`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/dieu-khoan`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/lien-he`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const slugs = await fetchAllProductSlugs();
  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
