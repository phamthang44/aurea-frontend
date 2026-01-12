import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * On-Demand Revalidation Endpoint
 *
 * Use this to invalidate cache when data is updated:
 * - POST /api/revalidate?tag=products - Invalidate all product caches
 * - POST /api/revalidate?tag=categories - Invalidate category caches
 * - POST /api/revalidate?tag=product-123 - Invalidate specific product
 *
 * Protected by a secret token in production
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tag = url.searchParams.get("tag");
    const secret = url.searchParams.get("secret");

    // Validate secret in production
    if (process.env.NODE_ENV === "production") {
      const expectedSecret = process.env.REVALIDATION_SECRET;
      if (!expectedSecret || secret !== expectedSecret) {
        return NextResponse.json(
          { error: "Invalid secret" },
          { status: 401 }
        );
      }
    }

    if (!tag) {
      return NextResponse.json(
        { error: "Missing tag parameter" },
        { status: 400 }
      );
    }

    // Revalidate the specified tag with 'max' profile (stale-while-revalidate)
    await revalidateTag(tag, "max");

    return NextResponse.json({
      success: true,
      revalidated: tag,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
