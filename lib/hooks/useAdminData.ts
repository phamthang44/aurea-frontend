import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import { CategoryResponse, ApiResult } from "@/lib/types/product";

/**
 * Hook to fetch all categories for the admin panel.
 * Uses React Query for automatic caching and revalidation.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const response = await clientApi.getCategories();
      if (response.error) {
        throw new Error(response.error.message || "Failed to load categories");
      }
      const result = response.data as ApiResult<CategoryResponse[]>;
      return result?.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

/**
 * Hook to fetch products for the admin panel with search, status filter, and pagination.
 * Uses React Query for automatic caching and revalidation based on search params.
 */
export function useAdminProducts(params: any) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: async () => {
      const { searchAdminProducts } = await import("@/lib/api/products");
      const result = await searchAdminProducts(params);
      return result;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60, // 1 minute cache
  });
}

