/**
 * TypeScript types for Product API DTOs
 * Based on backend Java DTOs
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

export interface ApiResult<T> {
  data?: T;
  meta?: {
    message?: string;
    serverTime?: number;
    apiVersion?: string;
    traceId?: string;
  };
  error?: {
    code?: string;
    message?: string;
    traceId?: string;
    details?: unknown;
  };
}

