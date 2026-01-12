import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * BFF Endpoint: Categories with Heavy Caching
 *
 * Categories rarely change, so we can cache aggressively:
 * - Server: 5 minute revalidation
 * - CDN/Browser: 1 hour with stale-while-revalidate
 *
 * Use on-demand revalidation when categories are updated via:
 * revalidateTag('categories')
 */
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      headers: { "Content-Type": "application/json" },
      next: {
        revalidate: 300, // 5 minutes
        tags: ["categories"],
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[BFF Categories] Fetch failed:", data.error);
      return NextResponse.json(
        { error: data.error, data: [] },
        { status: response.status }
      );
    }

    // Normalize response structure
    const categories = data?.data?.data || data?.data || [];

    return NextResponse.json(
      { data: categories },
      {
        status: 200,
        headers: {
          // Aggressive caching for categories
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("[BFF Categories] Error:", error);
    return NextResponse.json(
      { error: { message: error.message }, data: [] },
      { status: 500 }
    );
  }
}
