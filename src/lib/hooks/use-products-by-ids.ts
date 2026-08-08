"use client";

import { useEffect, useState } from "react";
import { fetchProductBySlug } from "@/lib/api/products";
import { mapApiProduct } from "@/lib/api/map-product";
import { ApiRequestError } from "@/lib/api-client";
import type { Product } from "@/lib/types";

const EMPTY_CATEGORY_NAMES = new Map<string, string>();

/**
 * Fetches products by id from the backend in parallel, dropping any that no
 * longer exist there (`/products/:idOrSlug` accepts a Mongo id or a slug).
 * Used by the wishlist, which only ever holds ids client-side.
 */
export function useProductsByIds(ids: string[]): { products: Product[]; isLoading: boolean } {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const idsKey = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no request to make with an empty id list
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all(
      ids.map(async (id) => {
        try {
          const { product } = await fetchProductBySlug(id);
          return mapApiProduct(product, EMPTY_CATEGORY_NAMES);
        } catch (err) {
          if (err instanceof ApiRequestError && err.status === 404) return null;
          throw err;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((p): p is Product => p !== null));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return { products, isLoading };
}
