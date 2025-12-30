/**
 * TypeScript types for Product API DTOs
 * Based on backend Java DTOs
 *
 * IMPORTANT: All ID fields (id, categoryId, etc.) use `string` type
 * because the backend uses TSID (Time-Sorted Unique Identifier) which is a Long type in Java.
 * JavaScript's `number` type has a precision limit (Number.MAX_SAFE_INTEGER = 2^53 - 1),
 * so TSID values larger than this would lose precision if stored as numbers.
 * Always use `string` for IDs to prevent precision loss.
 */

export interface VariantResponse {
  id: string;
  sku: string;
  priceOverride?: number;
  quantity: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName?: string;
  status?: string;
  thumbnail?: string;
  images?: string[];
  variants?: VariantResponse[];
}

export interface CreateVariantRequest {
  sku?: string;
  priceOverride?: number;
  quantity: number;
  attributes: Record<string, string>;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  variants: CreateVariantRequest[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  images?: string[];
}

export interface CreateGeneralInfoProductRequest {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  slug?: string;
  thumbnail?: string;
  images?: string[];
  variants?: UpdateVariantRequest[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface UpdateProductInfoRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  slug?: string;
  thumbnail?: string;
  images?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface UpdateVariantRequest {
  sku?: string;
  priceOverride?: number;
  quantity?: number;
  attributes?: Record<string, string>;
}

export interface ProductFilter {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  createdBy?: string;
  updatedBy?: string;
  status?: string;
}

export interface ApiResult<T> {
  data?: T;
  meta?: {
    message?: string;
    serverTime?: number;
    apiVersion?: string;
    traceId?: string;
    // Pagination metadata
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
  };
  error?: {
    code?: string;
    message?: string;
    traceId?: string;
    details?: unknown;
  };
}
