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
  productCount?: number; // Added for UI display
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
  sellingPrice: number;
  originalPrice: number;
  costPrice: number;
  quantity: number; // Read-only for updates - managed by Inventory Module
  attributes: VariantAttributes;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Product asset (image/video) - matches backend ProductAsset entity
 */
export interface ProductAsset {
  id?: string; // Optional for new assets
  url: string;
  publicId?: string | null;
  type: "IMAGE" | "VIDEO";
  isThumbnail: boolean;
  position: number;
  variantId?: string | null; // Null if it's a general product image
  metaData?: Record<string, any> | null;
}

/**
 * Product response with all details
 */
export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  originalPrice: number;
  costPrice: number;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  assets: ProductAsset[]; // Replaced images: string[]
  variants: VariantResponse[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Optional fields
  status?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  // Stock information (computed from inventory)
  availableStock?: number; // Total available stock across all variants
  inStock?: boolean; // Whether product has any available stock
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
  images?: string[];
  /** @deprecated Use assets array with isThumbnail=true instead */
  thumbnail?: string;
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
  sellingPrice: number;
  originalPrice: number;
  costPrice: number;
  quantity: number; // Initial stock (only used on creation)
  isActive?: boolean; // Default: true
}

/**
 * Asset request for creating/updating products
 */
export interface AssetRequest {
  id?: string; // Optional for new assets, required for updates
  url: string;
  publicId?: string | null;
  type: "IMAGE" | "VIDEO";
  isThumbnail?: boolean;
  position?: number;
  variantId?: string | null;
  metaData?: Record<string, any> | null;
}

/**
 * Request payload for creating a complete product with variants
 * POST /api/v1/products
 */
export interface CreateProductRequest {
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  categoryId: string;
  assets?: AssetRequest[]; // Replaced images: string[]
  isActive?: boolean; // Default: true
  variants: CreateVariantRequest[]; // Can be empty array
  // Optional fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
  images?: string[];
  /** @deprecated Use assets array with isThumbnail=true instead */
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
  minPrice: number;
  assets?: AssetRequest[]; // Replaced images?: string[]
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
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
  sellingPrice?: number;
  originalPrice?: number;
  costPrice?: number;
  // quantity is omitted - updates are ignored by backend
  isActive?: boolean;
}

/**
 * Variant with ID for update operations
 * Used when updating product with existing variants via PUT /api/v1/products/{id}
 * 
 * ⚠️ IMPORTANT: quantity is NOT included in full product updates
 * - When updating a product via PUT /api/v1/products/{id}, quantity changes for existing variants are IGNORED
 * - To update quantity for an existing variant, use PUT /api/v1/products/variants/{id} with VariantStockUpdatedEvent
 * - Quantity is only used when creating NEW variants (for initial inventory initialization)
 * 
 * This design ensures:
 * - Full product updates focus on product-level and variant metadata (price, attributes, status)
 * - Stock quantity updates go through dedicated variant endpoints for proper inventory event handling
 */
export interface UpdateVariantWithId extends UpdateVariantRequest {
  id: string; // Required for updates
  sku: string; // Required but immutable - sent for reference
  /**
   * ⚠️ DO NOT INCLUDE quantity in UpdateVariantWithId
   * Quantity updates for existing variants must be done via:
   * - PUT /api/v1/products/variants/{id} (single variant update with quantity)
   * - Or use Inventory Module APIs directly
   * 
   * Quantity is only accepted for NEW variants (when id is null in CreateVariantRequest)
   */
  // quantity is intentionally omitted - will be ignored by backend if included
}

/**
 * @deprecated Use AssetRequest instead. This interface is kept for backward compatibility.
 */
export interface ProductImage {
  url: string;
  type: "GENERAL" | "VARIANT";
  key?: string | null;
  value?: string | null;
}

/**
 * Request payload for updating complete product
 * PUT /api/v1/products/{id}
 * - Variants WITH id: Updated (metadata only - price, attributes, status)
 * - Variants WITHOUT id: Created (new variants with initial quantity)
 * - Existing variants NOT in list: Preserved unchanged
 * 
 * ⚠️ IMPORTANT LIMITATION: Quantity Updates
 * - Quantity changes for EXISTING variants (UpdateVariantWithId) are IGNORED in full product updates
 * - To update quantity for an existing variant, use the variant-specific endpoint:
 *   PUT /api/v1/products/variants/{id} with quantity field
 * - Quantity is ONLY used when creating NEW variants (CreateVariantRequest) for initial inventory setup
 * 
 * This design ensures proper inventory event handling and separation of concerns.
 */
export interface UpdateProductRequest {
  name: string;
  description: string;
  minPrice: number;
  categoryId: string;
  assets?: AssetRequest[]; // Replaced images: ProductImage[]
  isActive: boolean;
  variants: (CreateVariantRequest | UpdateVariantWithId)[]; // Mix of new and existing
  // Optional fields
  slug?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
  images?: ProductImage[] | string[];
  /** @deprecated Use assets array with isThumbnail=true instead */
  thumbnail?: string;
}

/**
 * Request payload for updating product info only (no variants)
 * PATCH /api/v1/products/{id}
 */
export interface UpdateProductInfoRequest {
  name?: string;
  description?: string;
  minPrice?: number;
  categoryId?: string;
  assets?: AssetRequest[]; // Replaced images?: ProductImage[]
  isActive?: boolean;
  slug?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
  images?: ProductImage[] | string[];
  /** @deprecated Use assets array with isThumbnail=true instead */
  thumbnail?: string;
}

/**
 * Request payload for updating variant info only (no status)
 * PUT /api/v1/products/variants/{id}/info
 */
export interface UpdateVariantInfoRequest {
  attributes: VariantAttributes;
  sellingPrice?: number;
  originalPrice?: number;
  costPrice?: number;
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
  minPrice: number;
  categoryId: string;
  assets: ProductAsset[]; // Replaced images: string[]
  isActive: boolean;
  variants: VariantFormData[];
  // Deprecated fields (kept for backward compatibility during migration)
  /** @deprecated Use assets array instead */
  images?: string[];
  /** @deprecated Use assets array with isThumbnail=true instead */
  thumbnail?: string;
}

/**
 * Form state for variant creation/editing
 * Note: quantity is included in form state for UI display,
 * but will be filtered out when converting to UpdateVariantWithId for full product updates
 */
export interface VariantFormData {
  id?: string; // Only for editing existing variants
  sku: string;
  attributes: VariantAttributes;
  sellingPrice: number;
  originalPrice: number;
  costPrice: number;
  quantity: number; // Used in UI, but filtered out for UpdateVariantWithId in full product updates
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
  finalPrice: number; // minPrice or lowest variant price
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
      ? Math.min(...variants.map((v) => v.sellingPrice || product.minPrice))
      : product.minPrice;

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

// ============================================================================
// New API DTOs for Public/Admin Separation
// ============================================================================

/**
 * Auditor response - user who created/updated the entity
 */
export interface AuditorResponse {
  username: string;
  email: string;
  id: string;
  avatarUrl?: string;
}

/**
 * Lightweight DTO for customer-facing storefront (Public API)
 * Returned by GET /api/v1/products (forces ACTIVE status)
 */
export interface ProductListingDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
  categoryName: string;
  availableStock: number;
  inStock: boolean;
  // Added for Shop Redesign based on backend facts
  rating?: number;
  reviewCount?: number;
  availableColors?: string[]; // Array of color codes/names
  brand?: string;
  isNew?: boolean;
  onSale?: boolean;
  discountPrice?: number;
}

/**
 * Asset response for admin
 */
export interface AssetResponse {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  variantId?: string;
  position: number;
}

/**
 * Detailed DTO for admin backoffice
 * Returned by GET /api/v1/products/admin
 */
export interface ProductResponseAdmin {
  id: string;
  name: string;
  slug: string;
  description: string;
  minPrice: number;
  originalPrice: number;
  costPrice: number;
  categoryId: string;
  categoryName: string;
  status: "ACTIVE" | "DRAFT" | "HIDDEN" | "ARCHIVED";
  assets: AssetResponse[];
  variants: VariantResponse[];
  createdBy?: AuditorResponse | null;
  updatedBy?: AuditorResponse | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product search request for both public and admin APIs
 */
export interface ProductSearchRequest {
  keyword?: string;
  categoryId?: number; // Backend still uses numeric ID internally
  categorySlug?: string; // Frontend-friendly slug for filtering
  minPrice?: number;
  maxPrice?: number;
  status?: "ACTIVE" | "DRAFT" | "HIDDEN" | "ARCHIVED";
  page?: number;
  size?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  // Added for Shop Redesign based on backend facts
  sizeFilter?: string;
  color?: string;
  brand?: string;
  inStock?: boolean;
}

/**
 * API Result with pagination support - matches backend ApiResult structure
 */
export interface PaginatedApiResult<T> {
  data: T;
  meta?: {
    serverTime?: number;
    apiVersion?: string;
    traceId?: string;
    message?: string;
    // Offset Pagination
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    // Sort & Filter
    sort?: string;
    filter?: Record<string, any>;
  };
  error?: {
    code: string;
    message: string;
    traceId?: string;
    details?: any;
  };
}
