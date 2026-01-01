/**
 * TypeScript types for Product & Category API DTOs
 * Based on backend Java DTOs and api-flows-for-frontend.md
 *
 * IMPORTANT: All ID fields (id, categoryId, etc.) use `string` type
 * because the backend uses TSID (Time-Sorted Unique Identifier) which is a Long type in Java.
 * JavaScript's `number` type has a precision limit (Number.MAX_SAFE_INTEGER = 2^53 - 1),
 * so TSID values larger than this would lose precision if stored as numbers.
 * Always use `string` for IDs to prevent precision loss.
 */

// ============================================================================
// Category Types (Tree Structure)
// ============================================================================

/**
 * Category with recursive children for tree structure
 * Returned by GET /api/v1/categories
 */
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  children: CategoryResponse[]; // Recursive tree structure
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request payload for creating a category
 * POST /api/v1/categories
 */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
}

/**
 * Request payload for updating category info
 * PUT /api/v1/categories/{id}
 * Note: Does NOT update status (use separate endpoint)
 */
export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string | null;
  // Note: slug is auto-generated from name on backend
}

/**
 * Request payload for updating category status
 * PATCH /api/v1/categories/{id}/status
 */
export interface UpdateCategoryStatusRequest {
  isActive: boolean;
}

// ============================================================================
// Variant Types
// ============================================================================

/**
 * Variant attributes (dynamic key-value pairs)
 * Examples: { color: "Red", size: "M" }
 */
export type VariantAttributes = Record<string, string>;

/**
 * Product variant response
 */
export interface VariantResponse {
  id: string;
  sku: string; // IMMUTABLE after creation
  priceOverride?: number;
  quantity: number; // Read-only for updates - managed by Inventory Module
  attributes: VariantAttributes;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Product response with all details
 */
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  images: string[];
  variants: VariantResponse[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Optional fields
  status?: string;
  thumbnail?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

// ============================================================================
// Create Requests
// ============================================================================

/**
 * Request payload for creating a variant
 * Used in POST /api/v1/products (embedded) or POST /api/v1/products/{id}/variants
 */
export interface CreateVariantRequest {
  sku?: string; // Optional - auto-generated if not provided
  attributes: VariantAttributes;
  priceOverride?: number;
  quantity: number; // Initial stock (only used on creation)
  isActive?: boolean; // Default: true
}

/**
 * Request payload for creating a complete product with variants
 * POST /api/v1/products
 */
export interface CreateProductRequest {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  isActive?: boolean; // Default: true
  variants: CreateVariantRequest[]; // Can be empty array
  // Optional fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
}

/**
 * Request payload for creating a draft product (no variants)
 * POST /api/v1/products/draft
 */
export interface CreateDraftProductRequest {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  images?: string[];
}

// ============================================================================
// Update Requests
// ============================================================================

/**
 * Request payload for updating a variant
 * PUT /api/v1/products/variants/{id}
 * IMPORTANT: quantity is IGNORED (use Inventory APIs to update stock)
 * IMPORTANT: sku is IMMUTABLE (cannot be changed)
 */
export interface UpdateVariantRequest {
  // sku is NOT included - it's immutable
  attributes: VariantAttributes;
  priceOverride?: number;
  // quantity is omitted - updates are ignored by backend
  isActive?: boolean;
}

/**
 * Variant with ID for update operations
 * Used when updating product with existing variants
 */
export interface UpdateVariantWithId extends UpdateVariantRequest {
  id: string; // Required for updates
  sku: string; // Required but immutable - sent for reference
}

/**
 * Request payload for updating complete product
 * PUT /api/v1/products/{id}
 * - Variants WITH id: Updated
 * - Variants WITHOUT id: Created (new variants)
 * - Existing variants NOT in list: Preserved unchanged
 */
export interface UpdateProductRequest {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
  variants: (CreateVariantRequest | UpdateVariantWithId)[]; // Mix of new and existing
  // Optional fields
  slug?: string;
  thumbnail?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

/**
 * Request payload for updating product info only (no variants)
 * PATCH /api/v1/products/{id}
 */
export interface UpdateProductInfoRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  images?: string[];
  isActive?: boolean;
  slug?: string;
  thumbnail?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

/**
 * Request payload for updating variant info only (no status)
 * PUT /api/v1/products/variants/{id}/info
 */
export interface UpdateVariantInfoRequest {
  attributes: VariantAttributes;
  priceOverride?: number;
}

/**
 * Request payload for updating variant status only
 * PUT /api/v1/products/variants/{id}/status
 */
export interface UpdateVariantStatusRequest {
  isActive: boolean;
}

// ============================================================================
// Query & Filter Types
// ============================================================================

/**
 * Query parameters for product search/filter
 * GET /api/v1/products
 */
export interface ProductFilter {
  keyword?: string; // Search in name/description
  categoryId?: string; // Filter by category
  minPrice?: number; // Minimum price filter
  maxPrice?: number; // Maximum price filter
  page?: number; // Page number (default: 1)
  size?: number; // Items per page (default: 10)
}

// ============================================================================
// Response Wrappers
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

/**
 * Product list response
 */
export type ProductListResponse = PageResponse<ProductResponse>;

/**
 * Standard API result wrapper
 */

/**
 * Standard API result wrapper
 */
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

// ============================================================================
// Helper Types & Type Guards
// ============================================================================

/**
 * Type guard to check if API result has data
 */
export function hasData<T>(
  result: ApiResult<T>
): result is Required<Pick<ApiResult<T>, "data">> & ApiResult<T> {
  return result.data !== undefined && result.data !== null;
}

/**
 * Type guard to check if API result has error
 */
export function hasError<T>(
  result: ApiResult<T>
): result is Required<Pick<ApiResult<T>, "error">> & ApiResult<T> {
  return result.error !== undefined && result.error !== null;
}

/**
 * Extract data from API result or throw error
 */
export function extractData<T>(result: ApiResult<T>): T {
  if (hasError(result)) {
    throw new Error(result.error.message || "API request failed");
  }
  if (!hasData(result)) {
    throw new Error("No data in API response");
  }
  return result.data;
}

// ============================================================================
// Frontend-specific Types
// ============================================================================

/**
 * Form state for product creation/editing
 */
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  images: string[];
  isActive: boolean;
  variants: VariantFormData[];
}

/**
 * Form state for variant creation/editing
 */
export interface VariantFormData {
  id?: string; // Only for editing existing variants
  sku: string;
  attributes: VariantAttributes;
  priceOverride: number | null;
  quantity: number;
  isActive: boolean;
}

/**
 * Category tree node for UI rendering
 */
export interface CategoryTreeNode extends CategoryResponse {
  level: number; // Depth in tree (0 = root)
  hasChildren: boolean;
  isExpanded?: boolean; // UI state
  isSelected?: boolean; // UI state
}

/**
 * Product with computed fields for UI
 */
export interface ProductWithComputed extends ProductResponse {
  finalPrice: number; // basePrice or lowest variant price
  isInStock: boolean; // Any variant has quantity > 0
  totalStock: number; // Sum of all variant quantities
  variantCount: number; // Number of variants
}

/**
 * Flatten category tree to list with levels
 */
export function flattenCategoryTree(
  categories: CategoryResponse[],
  level: number = 0
): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];

  for (const category of categories) {
    const node: CategoryTreeNode = {
      ...category,
      level,
      hasChildren: category.children && category.children.length > 0,
    };
    result.push(node);

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children, level + 1));
    }
  }

  return result;
}

/**
 * Compute additional fields for product display
 */
export function computeProductFields(
  product: ProductResponse
): ProductWithComputed {
  const variants = product.variants || [];

  // Find lowest price among variants (or use base price)
  const finalPrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.priceOverride || product.basePrice))
      : product.basePrice;

  // Check if any variant is in stock
  const isInStock = variants.some((v) => v.quantity > 0 && v.isActive);

  // Calculate total stock
  const totalStock = variants.reduce(
    (sum, v) => sum + (v.isActive ? v.quantity : 0),
    0
  );

  return {
    ...product,
    finalPrice,
    isInStock,
    totalStock,
    variantCount: variants.length,
  };
}
