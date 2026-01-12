"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ShopPageData } from "@/app/api/bff/shop/route";
import {
  ProductListingDto,
  ProductSearchRequest,
} from "@/lib/types/product";

/**
 * Filter state interface
 */
export interface ProductFilters {
  keyword: string;
  categorySlug: string | null;
  priceRange: [number | null, number | null];
  sort: ProductSearchRequest["sort"];
}

/**
 * Pagination state interface
 */
export interface ProductPagination {
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

export interface UseProductStorefrontOptimizedReturn {
  products: ProductListingDto[];
  categories: any[];
  isLoading: boolean;
  error: Error | null;
  filters: ProductFilters;
  setFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => void;
  pagination: ProductPagination;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_FILTERS: ProductFilters = {
  keyword: "",
  categorySlug: null,
  priceRange: [null, null],
  sort: "newest",
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
};

/**
 * Debounce hook for keyword search
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Optimized Product Storefront Hook
 *
 * Uses BFF endpoint /api/bff/shop which:
 * 1. Batches products + categories in a single request
 * 2. Resolves categorySlug → categoryId server-side (no waterfall)
 * 3. Has proper caching (30s products, 5min categories)
 *
 * Benefits over original:
 * - 50% fewer API calls (1 instead of 2)
 * - No waterfall from slug resolution
 * - Server-side caching reduces origin load
 */
export function useProductStorefrontOptimized(): UseProductStorefrontOptimizedReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFiltersState] = useState<ProductFilters>(() => ({
    keyword: searchParams.get("keyword") || DEFAULT_FILTERS.keyword,
    categorySlug: searchParams.get("category") || null,
    priceRange: [
      searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
      searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    ] as [number | null, number | null],
    sort:
      (searchParams.get("sort") as ProductSearchRequest["sort"]) ||
      DEFAULT_FILTERS.sort,
  }));

  const [pagination, setPaginationState] = useState(() => ({
    page: Number(searchParams.get("page")) || DEFAULT_PAGINATION.page,
    limit: Number(searchParams.get("limit")) || DEFAULT_PAGINATION.limit,
    totalElements: 0,
    totalPages: 0,
  }));

  const debouncedKeyword = useDebounce(filters.keyword, 400);

  // Build BFF query params
  const bffParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", pagination.page.toString());
    params.set("size", pagination.limit.toString());
    params.set("sort", filters.sort || "newest");

    if (debouncedKeyword.trim()) {
      params.set("keyword", debouncedKeyword.trim());
    }
    if (filters.categorySlug) {
      params.set("category", filters.categorySlug);
    }
    if (filters.priceRange[0] !== null) {
      params.set("minPrice", filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] !== null) {
      params.set("maxPrice", filters.priceRange[1].toString());
    }

    return params.toString();
  }, [
    debouncedKeyword,
    filters.categorySlug,
    filters.priceRange,
    filters.sort,
    pagination.page,
    pagination.limit,
  ]);

  // Fetch from BFF endpoint - single request for products + categories
  const {
    data: shopData,
    isLoading,
    error: queryError,
  } = useQuery<ShopPageData>({
    queryKey: ["shop", "bff", bffParams],
    queryFn: async () => {
      const response = await fetch(`/api/bff/shop?${bffParams}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch shop data");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds client-side stale time
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });

  // Extract data from BFF response
  const products = useMemo(() => shopData?.products || [], [shopData]);
  const categories = useMemo(() => shopData?.categories || [], [shopData]);

  // Update pagination from API response
  useEffect(() => {
    if (shopData?.meta) {
      setPaginationState((prev) => ({
        ...prev,
        totalElements: shopData.meta.totalElements || 0,
        totalPages: shopData.meta.totalPages || 0,
      }));
    }
  }, [shopData]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.priceRange[0] !== null)
      params.set("minPrice", filters.priceRange[0].toString());
    if (filters.priceRange[1] !== null)
      params.set("maxPrice", filters.priceRange[1].toString());
    if (filters.sort && filters.sort !== DEFAULT_FILTERS.sort)
      params.set("sort", filters.sort);
    if (pagination.page > 1) params.set("page", pagination.page.toString());
    if (pagination.limit !== DEFAULT_PAGINATION.limit)
      params.set("limit", pagination.limit.toString());

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedKeyword,
    filters.categorySlug,
    filters.priceRange,
    filters.sort,
    pagination.page,
    pagination.limit,
    pathname,
    router,
  ]);

  const setFilter = useCallback<
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  >((key, value) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key !== "sort") {
        setPaginationState((prev) => ({ ...prev, page: 1 }));
      }
      return newFilters;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setPaginationState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPaginationState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPaginationState((prev) => ({
      ...prev,
      page: DEFAULT_PAGINATION.page,
      limit: DEFAULT_PAGINATION.limit,
    }));
  }, []);

  return {
    products,
    categories,
    isLoading,
    error: queryError as Error | null,
    filters,
    setFilter,
    pagination,
    setPage,
    setLimit,
    resetFilters,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}
