import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ShopPageData {
  products: any[];
  categories: any[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * BFF Endpoint: Shop Page Data Aggregator
 *
 * Optimizations:
 * 1. Batches products + categories in parallel
 * 2. Resolves categorySlug → categoryId server-side (eliminates client waterfall)
 * 3. Caches categories for 5 minutes (rarely change)
 * 4. Products cached for 30 seconds with stale-while-revalidate
 *
 * Query params supported:
 * - page, size, sort, keyword, category (slug), minPrice, maxPrice
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Parse query params
    const page = url.searchParams.get("page") || "1";
    const size = url.searchParams.get("size") || "12";
    const sort = url.searchParams.get("sort") || "newest";
    const keyword = url.searchParams.get("keyword") || "";
    const categorySlug = url.searchParams.get("category") || "";
    const minPrice = url.searchParams.get("minPrice") || "";
    const maxPrice = url.searchParams.get("maxPrice") || "";

    // First, fetch categories (cached for 5 min) - we need this to resolve slug
    const categoriesResponse = await fetch(
      `${API_BASE_URL}/api/v1/categories`,
      {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 300, // 5 minutes
          tags: ["categories"],
        },
      }
    );

    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData?.data?.data || categoriesData?.data || [];

    // Resolve categorySlug to categoryId server-side (eliminates client waterfall)
    let categoryId: string | null = null;
    if (categorySlug) {
      const findCategory = (
        cats: any[],
        slug: string
      ): { id: string } | null => {
        for (const cat of cats) {
          if (cat.slug === slug) return cat;
          if (cat.children) {
            const found = findCategory(cat.children, slug);
            if (found) return found;
          }
        }
        return null;
      };
      const foundCategory = findCategory(categories, categorySlug);
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }

    // Build products query
    const productParams = new URLSearchParams();
    productParams.set("page", page);
    productParams.set("size", size);
    productParams.set("sort", sort);
    if (keyword) productParams.set("keyword", keyword);
    if (categoryId) productParams.set("categoryId", categoryId);
    if (minPrice) productParams.set("minPrice", minPrice);
    if (maxPrice) productParams.set("maxPrice", maxPrice);

    // Fetch products with short cache (30s) for dynamic content
    const productsResponse = await fetch(
      `${API_BASE_URL}/api/v1/products?${productParams.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 30, // 30 seconds for product listings
          tags: ["products"],
        },
      }
    );

    const productsData = await productsResponse.json();

    // Aggregate response
    const aggregatedData: ShopPageData = {
      products: productsData?.data || [],
      categories,
      meta: productsData?.meta || {
        page: parseInt(page),
        size: parseInt(size),
        totalElements: 0,
        totalPages: 0,
      },
    };

    return NextResponse.json(aggregatedData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("[BFF Shop] Error:", error);
    return NextResponse.json(
      {
        error: { message: error.message || "Failed to fetch shop data" },
        products: [],
        categories: [],
        meta: { page: 1, size: 12, totalElements: 0, totalPages: 0 },
      },
      { status: 500 }
    );
  }
}
