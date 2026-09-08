import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiRequestError } from "@/lib/api-client";
import { fetchProductBySlug } from "@/lib/api/products";
import { QuoteBuilder } from "./quote-builder";

type QuotePageProps = {
  params: Promise<{ slug: string }>;
};

async function loadProduct(slug: string) {
  try {
    return (await fetchProductBySlug(slug)).product;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  return { title: product ? `Báo giá ${product.name}` : "Báo giá sản phẩm" };
}

export default async function ProductQuotePage({ params }: QuotePageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  return <QuoteBuilder product={product} />;
}
