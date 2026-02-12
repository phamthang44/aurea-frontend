"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchPublicProducts } from "@/lib/api/products";
import {
  ProductListingDto,
  ProductSearchRequest,
  PaginatedApiResult,
} from "@/lib/types/product";

/**
 * Filter state interface
 */
export interface ProductFilters {
  keyword: string;
  categorySlug: string | null;
  priceRange: [number | null, number | null];
  sort: ProductSearchRequest["sort"];
  size: string | null;
  color: string | null;

  inStock: boolean | null;
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

/**
 * Hook return type
 */
export interface UseProductStorefrontReturn {
  products: ProductListingDto[];
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

/**
 * Default filter values
 */
const DEFAULT_FILTERS: ProductFilters = {
  keyword: "",
  categorySlug: null,
  priceRange: [null, null],
  sort: "newest",
  size: null,
  color: null,

  inStock: null,
};

/**
 * Default pagination values
 */
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

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing product storefront state and data fetching
 */
export function useProductStorefront(): UseProductStorefrontReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFiltersState] = useState<ProductFilters>(() => {
    return {
      keyword: searchParams.get("keyword") || DEFAULT_FILTERS.keyword,
      categorySlug: searchParams.get("category") || null,
      priceRange: [
        searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
        searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
      ] as [number | null, number | null],
      sort: (searchParams.get("sort") as ProductSearchRequest["sort"]) || DEFAULT_FILTERS.sort,
      size: searchParams.get("size") || null,
      color: searchParams.get("color") || null,

      inStock: searchParams.get("inStock") === "true" ? true : searchParams.get("inStock") === "false" ? false : null,
    };
  });

  const [pagination, setPaginationState] = useState(() => {
    return {
      page: Number(searchParams.get("page")) || DEFAULT_PAGINATION.page,
      limit: Number(searchParams.get("limit")) || DEFAULT_PAGINATION.limit,
      totalElements: 0,
      totalPages: 0,
    };
  });

  // Debounce keyword to avoid spamming API
  const debouncedKeyword = useDebounce(filters.keyword, 400);

  // Build API request params
  const apiParams = useMemo<ProductSearchRequest>(() => {
    const params: ProductSearchRequest = {
      page: pagination.page,
      size: pagination.limit,
      sort: filters.sort,
    };

    if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
    if (filters.categorySlug) params.categorySlug = filters.categorySlug;
    if (filters.priceRange[0] !== null) params.minPrice = filters.priceRange[0]!;
    if (filters.priceRange[1] !== null) params.maxPrice = filters.priceRange[1]!;
    if (filters.size) params.sizeFilter = filters.size;
    if (filters.color) params.color = filters.color;

    if (filters.inStock !== null) params.inStock = filters.inStock;

    return params;
  }, [debouncedKeyword, filters, pagination.page, pagination.limit]);

  // Fetch products using TanStack Query
  const {
    data: queryResult,
    isLoading,
    error: queryError,
  } = useQuery<PaginatedApiResult<ProductListingDto[]>>({
    queryKey: ["products", "storefront", apiParams],
    queryFn: async () => {
      const result = await searchPublicProducts(apiParams);
      if (result.error) throw new Error(result.error.message || "API request failed");
      return result;
    },
    staleTime: 30 * 1000,
  });

  // Extract products from API response
  const products = useMemo(() => {
    if (!queryResult?.data) return [];
    return Array.isArray(queryResult.data) ? queryResult.data : [];
  }, [queryResult]);

  // Update pagination from API response
  useEffect(() => {
    if (queryResult?.meta) {
      setPaginationState((prev) => ({
        ...prev,
        totalElements: queryResult.meta?.totalElements || 0,
        totalPages: queryResult.meta?.totalPages || 0,
      }));
    }
  }, [queryResult]);

  // Sync state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedKeyword.trim()) params.set("keyword", debouncedKeyword.trim());
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.priceRange[0] !== null) params.set("minPrice", filters.priceRange[0]!.toString());
    if (filters.priceRange[1] !== null) params.set("maxPrice", filters.priceRange[1]!.toString());
    if (filters.sort && filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
    if (filters.size) params.set("size", filters.size);
    if (filters.color) params.set("color", filters.color);

    if (filters.inStock !== null) params.set("inStock", filters.inStock.toString());

    if (pagination.page > 1) params.set("page", pagination.page.toString());
    if (pagination.limit !== DEFAULT_PAGINATION.limit) params.set("limit", pagination.limit.toString());

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [debouncedKeyword, filters, pagination, pathname, router]);

  // Set filter function
  const setFilter = useCallback<
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  >((key, value) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key !== "sort") setPaginationState((prev) => ({ ...prev, page: 1 }));
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

  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPreviousPage = pagination.page > 1;

  return {
    products,
    isLoading,
    error: queryError as Error | null,
    filters,
    setFilter,
    pagination,
    setPage,
    setLimit,
    resetFilters,
    hasNextPage,
    hasPreviousPage,
  };
}

