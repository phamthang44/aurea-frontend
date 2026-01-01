/**
 * Product API Service
 * Based on api-flows-for-frontend.md
 * Uses the existing Axios client from lib/api-client.ts
 */

import apiClient from "../api-client";
import type {
  ProductResponse,
  CreateProductRequest,
  CreateDraftProductRequest,
  UpdateProductRequest,
  UpdateProductInfoRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  UpdateVariantInfoRequest,
  UpdateVariantStatusRequest,
  ProductFilter,
  ApiResult,
  ProductListResponse,
} from "../types/product";

// ============================================================================
// Product CRUD Operations
// ============================================================================

/**
 * Get all products with optional filtering and pagination
 * GET /api/v1/products
 *
 * @example
 * ```ts
 * const result = await productApi.getAllProducts({
 *   keyword: 'shirt',
 *   categoryId: '100',
 *   minPrice: 20,
 *   maxPrice: 50,
 *   page: 1,
 *   size: 20
 * });
 * ```
 */
export async function getAllProducts(
  params?: ProductFilter
): Promise<ApiResult<ProductListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append("keyword", params.keyword);
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params?.minPrice)
    queryParams.append("minPrice", params.minPrice.toString());
  if (params?.maxPrice)
    queryParams.append("maxPrice", params.maxPrice.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());

  const query = queryParams.toString();
  return apiClient.get<ProductListResponse>(
    `products${query ? `?${query}` : ""}`
  );
}

/**
 * Get product by ID
 * GET /api/v1/products/{id}
 *
 * @example
 * ```ts
 * const result = await productApi.getProductById('1000');
 * ```
 */
export async function getProductById(
  id: string
): Promise<ApiResult<ProductResponse>> {
  return apiClient.get<ProductResponse>(`products/${id}`);
}

/**
 * Get product by SEO-friendly slug
 * GET /api/v1/products/slug/{slug}
 *
 * @example
 * ```ts
 * const result = await productApi.getProductBySlug('premium-cotton-tshirt');
 * ```
 */
export async function getProductBySlug(
  slug: string
): Promise<ApiResult<ProductResponse>> {
  return apiClient.get<ProductResponse>(`products/slug/${slug}`);
}

/**
 * Create a complete product with variants
 * POST /api/v1/products
 *
 * Required Permission: PRODUCT_CREATE
 *
 * @example
 * ```ts
 * const result = await productApi.createProduct({
 *   name: 'Premium Cotton T-Shirt',
 *   slug: 'premium-cotton-tshirt',
 *   description: 'High quality cotton t-shirt',
 *   basePrice: 29.99,
 *   categoryId: '201',
 *   images: ['https://example.com/image1.jpg'],
 *   isActive: true,
 *   variants: [
 *     {
 *       sku: 'TSHIRT-RED-M',
 *       attributes: { color: 'Red', size: 'M' },
 *       priceOverride: 29.99,
 *       quantity: 100,
 *       isActive: true
 *     }
 *   ]
 * });
 * ```
 */
export async function createProduct(
  data: CreateProductRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.post<ProductResponse>("products", data);
}

/**
 * Create a draft product without variants (quick create)
 * POST /api/v1/products/draft
 *
 * Required Permission: PRODUCT_CREATE
 *
 * @example
 * ```ts
 * const result = await productApi.createDraftProduct({
 *   name: 'New Product Draft',
 *   slug: 'new-product-draft',
 *   description: 'To be completed later',
 *   categoryId: '201',
 *   basePrice: 49.99
 * });
 * ```
 */
export async function createDraftProduct(
  data: CreateDraftProductRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.post<ProductResponse>("products/draft", data);
}

/**
 * Update complete product including variants
 * PUT /api/v1/products/{id}
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * Important:
 * - Variants WITH id: Updated
 * - Variants WITHOUT id: Created (new)
 * - Existing variants NOT in list: Preserved unchanged
 * - SKU is immutable for existing variants
 * - Quantity field is IGNORED (use Inventory Module to update stock)
 *
 * @example
 * ```ts
 * const result = await productApi.updateProduct('1000', {
 *   name: 'Updated Product Name',
 *   description: 'Updated description',
 *   basePrice: 34.99,
 *   categoryId: '201',
 *   images: ['https://example.com/new-image.jpg'],
 *   isActive: true,
 *   variants: [
 *     {
 *       id: '2001',
 *       sku: 'TSHIRT-RED-M',
 *       attributes: { color: 'Dark Red', size: 'M' },
 *       priceOverride: 34.99,
 *       isActive: true
 *     }
 *   ]
 * });
 * ```
 */
export async function updateProduct(
  id: string,
  data: UpdateProductRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.put<ProductResponse>(`products/${id}`, data);
}

/**
 * Update product info only (without touching variants)
 * PATCH /api/v1/products/{id}
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * @example
 * ```ts
 * const result = await productApi.updateProductInfo('1000', {
 *   name: 'Updated Name',
 *   basePrice: 39.99,
 *   images: ['https://example.com/new-image.jpg']
 * });
 * ```
 */
export async function updateProductInfo(
  id: string,
  data: UpdateProductInfoRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.patch<ProductResponse>(`products/${id}`, data);
}

/**
 * Update product status only
 * PATCH /api/v1/products/{id}/status
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * @example
 * ```ts
 * const result = await productApi.updateProductStatus('1000', {
 *   productStatus: 'ACTIVE'
 * });
 * ```
 */
export async function updateProductStatus(
  id: string,
  data: { productStatus: string }
): Promise<ApiResult<ProductResponse>> {
  return apiClient.patch<ProductResponse>(`products/${id}/status`, data);
}

/**
 * Delete product (soft delete)
 * DELETE /api/v1/products/{id}
 *
 * Required Permission: PRODUCT_DELETE
 *
 * @example
 * ```ts
 * const result = await productApi.deleteProduct('1000');
 * ```
 */
export async function deleteProduct(id: string): Promise<ApiResult<void>> {
  return apiClient.delete<void>(`products/${id}`);
}

// ============================================================================
// Variant Operations
// ============================================================================

/**
 * Add a single variant to an existing product
 * POST /api/v1/products/{productId}/variants
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * Backend Events:
 * - Variant saved to database
 * - ProductCreatedEvent published
 * - Inventory module creates inventory record
 *
 * @example
 * ```ts
 * const result = await productApi.addVariant('1000', {
 *   sku: 'TSHIRT-YELLOW-M',
 *   attributes: { color: 'Yellow', size: 'M' },
 *   priceOverride: 32.99,
 *   quantity: 50,
 *   isActive: true
 * });
 * ```
 */
export async function addVariant(
  productId: string,
  data: CreateVariantRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.post<ProductResponse>(
    `products/${productId}/variants`,
    data
  );
}

/**
 * Update a single variant
 * PUT /api/v1/products/variants/{variantId}
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * Important:
 * - SKU is IMMUTABLE (cannot change)
 * - Quantity field is IGNORED (use Inventory Module)
 *
 * @example
 * ```ts
 * const result = await productApi.updateVariant('2004', {
 *   attributes: { color: 'Bright Yellow', size: 'M' },
 *   priceOverride: 37.99,
 *   isActive: true
 * });
 * ```
 */
export async function updateVariant(
  variantId: string,
  data: UpdateVariantRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.put<ProductResponse>(`products/variants/${variantId}`, data);
}

/**
 * Update variant info only (attributes and price, no status)
 * PUT /api/v1/products/variants/{variantId}/info
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * @example
 * ```ts
 * const result = await productApi.updateVariantInfo('2004', {
 *   attributes: { color: 'Bright Yellow', size: 'M' },
 *   priceOverride: 37.99
 * });
 * ```
 */
export async function updateVariantInfo(
  variantId: string,
  data: UpdateVariantInfoRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.put<ProductResponse>(
    `products/variants/${variantId}/info`,
    data
  );
}

/**
 * Toggle variant active status
 * PUT /api/v1/products/variants/{variantId}/status
 *
 * Required Permission: PRODUCT_UPDATE
 *
 * @example
 * ```ts
 * const result = await productApi.updateVariantStatus('2004', {
 *   isActive: false
 * });
 * ```
 */
export async function updateVariantStatus(
  variantId: string,
  data: UpdateVariantStatusRequest
): Promise<ApiResult<ProductResponse>> {
  return apiClient.put<ProductResponse>(
    `products/variants/${variantId}/status`,
    data
  );
}

/**
 * Delete a single variant (soft delete)
 * DELETE /api/v1/products/variants/{variantId}
 *
 * Required Permission: PRODUCT_DELETE
 *
 * @example
 * ```ts
 * const result = await productApi.deleteVariant('2004');
 * ```
 */
export async function deleteVariant(
  variantId: string
): Promise<ApiResult<void>> {
  return apiClient.delete<void>(`products/variants/${variantId}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Search products by keyword
 * Convenience function for keyword-only search
 */
export async function searchProducts(
  keyword: string,
  page: number = 1,
  size: number = 20
): Promise<ApiResult<ProductListResponse>> {
  return getAllProducts({ keyword, page, size });
}

/**
 * Get products by category
 * Convenience function for category filtering
 */
export async function getProductsByCategory(
  categoryId: string,
  page: number = 1,
  size: number = 20
): Promise<ApiResult<ProductListResponse>> {
  return getAllProducts({ categoryId, page, size });
}

/**
 * Get products in price range
 * Convenience function for price filtering
 */
export async function getProductsByPriceRange(
  minPrice: number,
  maxPrice: number,
  page: number = 1,
  size: number = 20
): Promise<ApiResult<ProductListResponse>> {
  return getAllProducts({ minPrice, maxPrice, page, size });
}

// Export as default object for cleaner imports
export const productApi = {
  // Product CRUD
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  createDraftProduct,
  updateProduct,
  updateProductInfo,
  updateProductStatus,
  deleteProduct,

  // Variant operations
  addVariant,
  updateVariant,
  updateVariantInfo,
  updateVariantStatus,
  deleteVariant,

  // Utility functions
  searchProducts,
  getProductsByCategory,
  getProductsByPriceRange,
};

export default productApi;
