"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/providers/recently-viewed-provider";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/ui/reveal";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";

export function RecentlyViewedSection({ currentSlug }: { currentSlug: string }) {
  const { slugs, recordView } = useRecentlyViewed();

  useEffect(() => {
    recordView(currentSlug);
    // Only record once per mount (product page navigation), not on every slugs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug]);

  const otherSlugs = slugs.filter((slug) => slug !== currentSlug).slice(0, 4);
  const { products: otherProducts } = useProductsByIds(otherSlugs);

  if (otherProducts.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-10">
        Sản phẩm bạn đã xem
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {otherProducts.map((product, i) => (
          <li key={product.id} className="list-none">
            <Reveal delay={(i % 4) * 80}>
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
