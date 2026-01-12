import {
  ProductListingDto,
  ProductResponseAdmin,
  ProductSearchRequest,
  PaginatedApiResult,
  ApiResult,
} from "@/lib/types/product";

// For client-side calls (use proxy)
const API_PROXY_URL = "/api/proxy";

// For server-side calls (direct to backend for caching)
const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Build query string from ProductSearchRequest
 * Note: For client-side calls with categorySlug, use the BFF endpoint instead
 * to avoid waterfall from slug → ID conversion
 */
function buildQueryString(params: ProductSearchRequest): string {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.append("keyword", params.keyword);
  if (params.categoryId)
    searchParams.append("categoryId", params.categoryId.toString());
  if (params.minPrice)
    searchParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice)
    searchParams.append("maxPrice", params.maxPrice.toString());
  if (params.status) searchParams.append("status", params.status);
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.size) searchParams.append("size", params.size.toString());
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.color) searchParams.append("color", params.color);
  if (params.brand) searchParams.append("brand", params.brand);
  if (params.sizeFilter) searchParams.append("size", params.sizeFilter);
  if (params.inStock !== undefined) searchParams.append("inStock", params.inStock.toString());

  return searchParams.toString();
}

/**
 * PUBLIC API - Customer/Storefront product search (Client-side)
 * Uses proxy for authentication handling
 *
 * Note: For shop page, prefer useProductStorefrontOptimized hook
 * which uses the BFF endpoint for better performance
 */
export async function searchPublicProducts(
  params: ProductSearchRequest = {}
): Promise<PaginatedApiResult<ProductListingDto[]>> {
  const queryString = buildQueryString({
    page: 1,
    size: 20,
    sort: "newest",
    ...params,
  });

  const response = await fetch(`${API_PROXY_URL}/products?${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Server-side product search with caching (for RSC/SSR)
 * Uses direct backend call with Next.js fetch caching
 */
export async function searchProductsServer(
  params: ProductSearchRequest = {},
  options?: { revalidate?: number; tags?: string[] }
): Promise<PaginatedApiResult<ProductListingDto[]>> {
  const queryString = buildQueryString({
    page: 1,
    size: 20,
    sort: "newest",
    ...params,
  });

  const response = await fetch(
    `${API_BACKEND_URL}/api/v1/products?${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: options?.revalidate ?? 60, // Default 60 second cache
        tags: options?.tags ?? ["products"],
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * ADMIN API - Backoffice product search
 * No caching - admin always needs fresh data
 */
export async function searchAdminProducts(
  params: ProductSearchRequest = {}
): Promise<PaginatedApiResult<ProductResponseAdmin[]>> {
  const queryString = buildQueryString({
    page: 1,
    size: 20,
    sort: "newest",
    ...params,
  });

  const response = await fetch(
    `${API_PROXY_URL}/products/admin?${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store", // Admin needs fresh data
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
  const response = await fetch(`${API_PROXY_URL}/products/${id}`, {
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
 * Get product by ID (Server-side with caching)
 */
export async function getProductByIdServer(
  id: string
): Promise<ApiResult<ProductListingDto>> {
  const response = await fetch(`${API_BACKEND_URL}/api/v1/products/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 300, // 5 minute cache for product detail
      tags: ["products", `product-${id}`],
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
  const response = await fetch(`${API_PROXY_URL}/products/slug/${slug}`, {
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
 * Get product by slug (Server-side with caching)
 */
export async function getProductBySlugServer(
  slug: string
): Promise<ApiResult<ProductListingDto>> {
  const response = await fetch(
    `${API_BACKEND_URL}/api/v1/products/slug/${slug}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // 5 minute cache for product detail
        tags: ["products", `product-${slug}`],
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}
