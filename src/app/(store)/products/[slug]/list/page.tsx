import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/api/products";
import { ApiRequestError } from "@/lib/api-client";
import { TierList } from "./tier-list";

export const metadata = { title: "Tier List | ZENOST Hobby Store" };


export default async function ProductListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug).then((r) => r.product).catch((error) => {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  });
  return <TierList key={product.id} product={{ slug: product.slug, name: product.name, brand: product.brand, heroImage: product.heroImage, variants: product.variants, manufacturerReviews: product.manufacturerReviews }} />;
}
