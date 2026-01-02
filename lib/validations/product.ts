/**
 * Zod validation schemas for Product & Category forms
 * Matches backend validation constraints from api-flows-for-frontend.md
 */

import { z } from "zod";

// ============================================================================
// Category Schemas
// ============================================================================

/**
 * Schema for creating a category
 * POST /api/v1/categories
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(150, "Slug must not exceed 150 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  parentId: z.string().nullable().optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

/**
 * Schema for updating category info
 * PUT /api/v1/categories/{id}
 */
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  parentId: z.string().nullable().optional(),
});

export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

/**
 * Schema for updating category status
 * PATCH /api/v1/categories/{id}/status
 */
export const updateCategoryStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateCategoryStatusFormData = z.infer<
  typeof updateCategoryStatusSchema
>;

// ============================================================================
// Variant Schemas
// ============================================================================

/**
 * Schema for variant attributes (dynamic key-value pairs)
 */
export const variantAttributesSchema = z.record(
  z.string().min(1, "Attribute key cannot be empty"),
  z.string().min(1, "Attribute value cannot be empty")
);

/**
 * Schema for creating a variant
 * POST /api/v1/products/{id}/variants or embedded in product creation
 */
export const createVariantSchema = z.object({
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must not exceed 50 characters")
    .regex(
      /^[A-Z0-9-_]+$/,
      "SKU must be uppercase letters, numbers, hyphens, or underscores"
    )
    .trim()
    .optional(), // Optional - auto-generated if not provided
  attributes: variantAttributesSchema.refine(
    (attrs) => Object.keys(attrs).length > 0,
    "At least one attribute is required (e.g., color, size)"
  ),
  priceOverride: z
    .number()
    .min(0, "Price cannot be negative")
    .max(999999.99, "Price is too large")
    .nullable()
    .optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(999999, "Quantity is too large"),
  isActive: z.boolean().default(true),
});

export type CreateVariantFormData = z.infer<typeof createVariantSchema>;

/**
 * Schema for updating a variant
 * PUT /api/v1/products/variants/{id}
 * Note: SKU is immutable, quantity is ignored (managed by Inventory Module)
 */
export const updateVariantSchema = z.object({
  attributes: variantAttributesSchema.refine(
    (attrs) => Object.keys(attrs).length > 0,
    "At least one attribute is required"
  ),
  priceOverride: z
    .number()
    .min(0, "Price cannot be negative")
    .max(999999.99, "Price is too large")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
  // Note: sku and quantity are NOT included - sku is immutable, quantity is ignored
});

export type UpdateVariantFormData = z.infer<typeof updateVariantSchema>;

/**
 * Schema for updating variant info only
 * PUT /api/v1/products/variants/{id}/info
 */
export const updateVariantInfoSchema = z.object({
  attributes: variantAttributesSchema,
  priceOverride: z
    .number()
    .min(0, "Price cannot be negative")
    .max(999999.99, "Price is too large")
    .nullable()
    .optional(),
});

export type UpdateVariantInfoFormData = z.infer<typeof updateVariantInfoSchema>;

/**
 * Schema for updating variant status
 * PUT /api/v1/products/variants/{id}/status
 */
export const updateVariantStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateVariantStatusFormData = z.infer<
  typeof updateVariantStatusSchema
>;

// ============================================================================
// Product Schemas
// ============================================================================

/**
 * Helper: Generate slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Schema for asset request
 */
export const assetRequestSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Invalid asset URL").min(1, "Asset URL is required"),
  publicId: z.string().nullable().optional(),
  type: z.enum(["IMAGE", "VIDEO"], {
    required_error: "Asset type is required",
  }),
  isThumbnail: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
  variantId: z.string().nullable().optional(),
  metaData: z.record(z.any()).nullable().optional(),
});

/**
 * Schema for creating a complete product
 * POST /api/v1/products
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(250, "Slug must not exceed 250 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .max(999999.99, "Base price is too large"),
  categoryId: z.string().min(1, "Category is required"),
  assets: z
    .array(assetRequestSchema)
    .min(1, "At least one asset is required")
    .max(50, "Maximum 50 assets allowed")
    .refine(
      (assets) => assets.some((asset) => asset.isThumbnail === true),
      "At least one asset must be marked as thumbnail"
    )
    .optional(),
  isActive: z.boolean().default(true),
  variants: z
    .array(createVariantSchema)
    .min(1, "At least one variant is required")
    .max(50, "Maximum 50 variants allowed"),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

/**
 * Schema for creating a draft product (no variants)
 * POST /api/v1/products/draft
 */
export const createDraftProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(250, "Slug must not exceed 250 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    )
    .trim(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .max(999999.99, "Base price is too large"),
  categoryId: z.string().min(1, "Category is required"),
  assets: z.array(assetRequestSchema).max(50, "Maximum 50 assets allowed").optional(),
});

export type CreateDraftProductFormData = z.infer<
  typeof createDraftProductSchema
>;

/**
 * Schema for updating complete product
 * PUT /api/v1/products/{id}
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .max(999999.99, "Base price is too large"),
  categoryId: z.string().min(1, "Category is required"),
  assets: z
    .array(assetRequestSchema)
    .min(1, "At least one asset is required")
    .max(50, "Maximum 50 assets allowed")
    .refine(
      (assets) => assets.some((asset) => asset.isThumbnail === true),
      "At least one asset must be marked as thumbnail"
    )
    .optional(),
  isActive: z.boolean(),
  variants: z
    .array(
      z.union([
        createVariantSchema, // New variants
        updateVariantSchema.extend({
          id: z.string(), // Existing variants must have ID
          sku: z.string(), // Required but immutable
        }),
      ])
    )
    .min(1, "At least one variant is required"),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

/**
 * Schema for updating product info only (no variants)
 * PATCH /api/v1/products/{id}
 */
export const updateProductInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .trim()
    .optional(),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .max(999999.99, "Base price is too large")
    .optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  assets: z
    .array(assetRequestSchema)
    .max(50, "Maximum 50 assets allowed")
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductInfoFormData = z.infer<typeof updateProductInfoSchema>;

// ============================================================================
// Query & Filter Schemas
// ============================================================================

/**
 * Schema for product filter/search params
 * GET /api/v1/products
 */
export const productFilterSchema = z.object({
  keyword: z.string().max(100).optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(20),
});

export type ProductFilterFormData = z.infer<typeof productFilterSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate and transform variant attributes
 */
export function validateVariantAttributes(attributes: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (Object.keys(attributes).length === 0) {
    errors.push("At least one attribute is required");
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (!key.trim()) {
      errors.push("Attribute key cannot be empty");
    }
    if (!value.trim()) {
      errors.push(`Attribute value for "${key}" cannot be empty`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SKU format
 */
export function validateSKU(sku: string): { isValid: boolean; error?: string } {
  if (sku.length === 0) {
    return { isValid: false, error: "SKU cannot be empty" };
  }

  if (sku.length > 50) {
    return { isValid: false, error: "SKU must not exceed 50 characters" };
  }

  if (!/^[A-Z0-9-_]+$/.test(sku)) {
    return {
      isValid: false,
      error:
        "SKU must contain only uppercase letters, numbers, hyphens, or underscores",
    };
  }

  return { isValid: true };
}

/**
 * Transform form data to create product request
 */
export function transformToCreateProductRequest(
  formData: CreateProductFormData
): CreateProductFormData {
  // Ensure slug is lowercase and properly formatted
  const slug = generateSlug(formData.name);

  return {
    ...formData,
    slug: formData.slug || slug,
    description: formData.description.trim(),
    variants: formData.variants.map((variant) => ({
      ...variant,
      sku:
        variant.sku ||
        generateSlug(
          `${formData.name}-${JSON.stringify(variant.attributes)}`
        ).toUpperCase(),
    })),
  };
}
