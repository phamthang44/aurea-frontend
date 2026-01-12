import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface HomepageData {
  featuredProducts: any[];
  categories: any[];
}

/**
 * BFF Endpoint: Homepage Data Aggregator
 *
 * Batches multiple backend API calls into a single request:
 * - Featured/newest products (8 items)
 * - All categories (for navigation)
 *
 * Implements server-side caching with ISR (Incremental Static Regeneration)
 * Revalidates every 60 seconds for fresh data without rebuilding
 */
export async function GET() {
  try {
    // Execute API calls in parallel (no waterfall)
    const [productsResponse, categoriesResponse] = await Promise.all([
      // Fetch featured products with 60s cache
      fetch(`${API_BASE_URL}/api/v1/products?page=1&size=8&sort=newest`, {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 60, // ISR: Revalidate every 60 seconds
          tags: ["products", "featured-products"],
        },
      }),
      // Fetch categories with 5 minute cache (categories rarely change)
      fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: { "Content-Type": "application/json" },
        next: {
          revalidate: 300, // ISR: Revalidate every 5 minutes
          tags: ["categories"],
        },
      }),
    ]);

    // Parse responses in parallel
    const [productsData, categoriesData] = await Promise.all([
      productsResponse.json(),
      categoriesResponse.json(),
    ]);

    // Handle potential errors from backend
    if (!productsResponse.ok) {
      console.error(
        "[BFF Homepage] Products fetch failed:",
        productsData.error
      );
    }
    if (!categoriesResponse.ok) {
      console.error(
        "[BFF Homepage] Categories fetch failed:",
        categoriesData.error
      );
    }

    // Aggregate response
    const aggregatedData: HomepageData = {
      featuredProducts: productsData?.data || [],
      categories: categoriesData?.data?.data || categoriesData?.data || [],
    };

    // Return with cache headers for CDN/browser caching
    return NextResponse.json(aggregatedData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("[BFF Homepage] Error:", error);
    return NextResponse.json(
      {
        error: { message: error.message || "Failed to fetch homepage data" },
        featuredProducts: [],
        categories: [],
      },
      { status: 500 }
    );
  }
}
