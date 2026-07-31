import type { MetadataRoute } from "next";

const BASE_URL = "https://zenoshobbystore.vn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/checkout", "/cart", "/wishlist", "/order-confirmation"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
