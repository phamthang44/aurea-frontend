/**
 * Server-side Category API with proper caching
 *
 * Categories rarely change, so we can cache aggressively.
 * Use these functions in Server Components for optimal performance.
 */

import type { CategoryResponse, ApiResult } from "../types/product";

const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Server-side: Get all categories with caching
 *
 * Uses 5-minute revalidation since categories rarely change.
 * For on-demand revalidation when categories are updated, use:
 * revalidateTag('categories')
 */
export async function getAllCategoriesServer(): Promise<
  ApiResult<CategoryResponse[]>
> {
  try {
    const response = await fetch(`${API_BACKEND_URL}/api/v1/categories`, {
      headers: { "Content-Type": "application/json" },
      next: {
        revalidate: 300, // 5 minutes
        tags: ["categories"],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: {
          code: "FETCH_ERROR",
          message: errorData?.error?.message || "Failed to fetch categories",
        },
      };
    }

    const data = await response.json();

    // Normalize response structure
    const categories = data?.data?.data || data?.data || [];

    return { data: categories };
  } catch (error: any) {
    return {
      error: {
        code: "NETWORK_ERROR",
        message: error.message || "Network error",
      },
    };
  }
}

/**
 * Server-side: Get category by ID with caching
 */
export async function getCategoryByIdServer(
  id: string
): Promise<ApiResult<CategoryResponse>> {
  const allCategoriesResult = await getAllCategoriesServer();

  if (!allCategoriesResult.data) {
    return {
      error: allCategoriesResult.error || {
        code: "NOT_FOUND",
        message: "Category not found",
      },
    };
  }

  const findCategory = (
    categories: CategoryResponse[],
    targetId: string
  ): CategoryResponse | null => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(allCategoriesResult.data, id);

  if (!category) {
    return {
      error: {
        code: "NOT_FOUND",
        message: `Category with ID ${id} not found`,
      },
    };
  }

  return { data: category };
}

/**
 * Server-side: Get category by slug with caching
 */
export async function getCategoryBySlugServer(
  slug: string
): Promise<ApiResult<CategoryResponse>> {
  const allCategoriesResult = await getAllCategoriesServer();

  if (!allCategoriesResult.data) {
    return {
      error: allCategoriesResult.error || {
        code: "NOT_FOUND",
        message: "Category not found",
      },
    };
  }

  const findCategory = (
    categories: CategoryResponse[],
    targetSlug: string
  ): CategoryResponse | null => {
    for (const category of categories) {
      if (category.slug === targetSlug) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(allCategoriesResult.data, slug);

  if (!category) {
    return {
      error: {
        code: "NOT_FOUND",
        message: `Category with slug "${slug}" not found`,
      },
    };
  }

  return { data: category };
}
