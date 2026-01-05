import {
  ProductListingDto,
  ProductResponseAdmin,
  ProductSearchRequest,
  PaginatedApiResult,
  ApiResult,
} from "@/lib/types/product";
import { getCategoryBySlug } from "./category";

// Use Next.js API proxy route which handles HttpOnly cookie authentication
const API_BASE_URL = "/api/proxy";

/**
 * Build query string from ProductSearchRequest
 * Converts categorySlug to categoryId if needed
 */
async function buildQueryString(params: ProductSearchRequest): Promise<string> {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.append("keyword", params.keyword);

  // Handle category: convert slug to ID if slug is provided
  if (params.categorySlug) {
    // Fetch category by slug to get its ID
    const categoryResult = await getCategoryBySlug(params.categorySlug);
    if (categoryResult.data) {
      searchParams.append("categoryId", categoryResult.data.id);
    }
    // If slug lookup fails, skip category filter (don't break the search)
  } else if (params.categoryId) {
    searchParams.append("categoryId", params.categoryId.toString());
  }

  if (params.minPrice)
    searchParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice)
    searchParams.append("maxPrice", params.maxPrice.toString());
  if (params.status) searchParams.append("status", params.status);
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.size) searchParams.append("size", params.size.toString());
  if (params.sort) searchParams.append("sort", params.sort);

  return searchParams.toString();
}

/**
 * PUBLIC API - Customer/Storefront product search
 * Forces ACTIVE status only
 */
export async function searchPublicProducts(
  params: ProductSearchRequest = {}
): Promise<PaginatedApiResult<ProductListingDto[]>> {
  const queryString = await buildQueryString({
    page: 1,
    size: 20,
    sort: "newest",
    ...params,
  });

  const response = await fetch(`${API_BASE_URL}/products?${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies if needed
    cache: "no-store", // For Next.js SSR
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * ADMIN API - Backoffice product search
 * Supports all statuses and detailed information
 * Uses HttpOnly cookies for authentication (automatically sent)
 */
export async function searchAdminProducts(
  params: ProductSearchRequest = {}
): Promise<PaginatedApiResult<ProductResponseAdmin[]>> {
  const queryString = await buildQueryString({
    page: 1,
    size: 20,
    sort: "newest",
    ...params,
  });

  const response = await fetch(
    `${API_BASE_URL}/products/admin?${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: sends HttpOnly cookies
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch admin products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get product by ID (public access)
 */
export async function getProductById(
  id: string
): Promise<ApiResult<ProductListingDto>> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get product by slug (public access)
 */
export async function getProductBySlug(
  slug: string
): Promise<ApiResult<ProductListingDto>> {
  const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}
