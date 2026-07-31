"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/store/empty-state";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";

export function WishlistGrid() {
  const { user, openLoginModal } = useAuth();
  const { favoriteIds } = useFavorites();
  const { products: favoriteProducts, isLoading } = useProductsByIds(favoriteIds);

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Đăng nhập để xem yêu thích"
        description="Bạn cần đăng nhập bằng Google để lưu và xem danh sách sản phẩm yêu thích của mình."
        action={
          <Button onClick={openLoginModal}>
            Đăng nhập với Google
          </Button>
        }
      />
    );
  }

  if (isLoading) return null;

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        icon="favorite_border"
        title="Chưa có sản phẩm yêu thích"
        description="Nhấn biểu tượng trái tim trên bất kỳ sản phẩm nào để lưu vào danh sách yêu thích của bạn."
        action={<Button href="/products">Khám phá sản phẩm</Button>}
      />
    );
  }

  return (
    <>
      <p className="text-on-surface-variant font-body-md mb-lg">
        {favoriteProducts.length} sản phẩm trong danh sách yêu thích của bạn.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        {favoriteProducts.map((product, i) => (
          <li key={product.id} className="list-none">
            <Reveal delay={(i % 8) * 60}>
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mt-lg text-center">
        <Link href="/products" className="font-label-md text-label-md text-primary hover:underline">
          Tiếp tục khám phá sản phẩm →
        </Link>
      </div>
    </>
  );
}
