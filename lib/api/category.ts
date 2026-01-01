/**
 * Category API Service
 * Based on api-flows-for-frontend.md
 * Uses the existing Axios client from lib/api-client.ts
 */

import apiClient from "../api-client";
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
  ApiResult,
} from "../types/product";

// ============================================================================
// Category CRUD Operations
// ============================================================================

/**
 * Get all categories as a hierarchical tree structure
 * GET /api/v1/categories
 *
 * Returns complete tree with parent-child relationships.
 * The tree is built server-side using O(n) algorithm.
 *
 * @example
 * ```ts
 * const result = await categoryApi.getAllCategories();
 * if (result.data) {
 *   const categories = result.data; // Tree structure with children
 * }
 * ```
 */
export async function getAllCategories(): Promise<
  ApiResult<CategoryResponse[]>
> {
  return apiClient.get<CategoryResponse[]>("categories");
}

/**
 * Get category by ID
 * GET /api/v1/categories/{id}
 *
 * @example
 * ```ts
 * const result = await categoryApi.getCategoryById('100');
 * ```
 */
export async function getCategoryById(
  id: string
): Promise<ApiResult<CategoryResponse>> {
  // Note: This endpoint is not in clientApi yet, need to add it
  // For now, we'll fetch all categories and find the one we need
  const allCategoriesResult = await getAllCategories();

  if (!allCategoriesResult.data) {
    return {
      error: {
        code: "NOT_FOUND",
        message: "Category not found",
      },
    };
  }

  // Recursively search for category by ID
  const findCategory = (
    categories: CategoryResponse[],
    targetId: string
  ): CategoryResponse | null => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(allCategoriesResult.data, id);

  if (!category) {
    return {
      error: {
        code: "NOT_FOUND",
        message: `Category with ID ${id} not found`,
      },
    };
  }

  return {
    data: category,
  };
}

/**
 * Get category by SEO-friendly slug
 * GET /api/v1/categories/slug/{slug}
 *
 * @example
 * ```ts
 * const result = await categoryApi.getCategoryBySlug('electronics');
 * ```
 */
export async function getCategoryBySlug(
  slug: string
): Promise<ApiResult<CategoryResponse>> {
  // Similar to getCategoryById, we need to implement this in clientApi
  const allCategoriesResult = await getAllCategories();

  if (!allCategoriesResult.data) {
    return {
      error: {
        code: "NOT_FOUND",
        message: "Category not found",
      },
    };
  }

  // Recursively search for category by slug
  const findCategory = (
    categories: CategoryResponse[],
    targetSlug: string
  ): CategoryResponse | null => {
    for (const category of categories) {
      if (category.slug === targetSlug) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(allCategoriesResult.data, slug);

  if (!category) {
    return {
      error: {
        code: "NOT_FOUND",
        message: `Category with slug "${slug}" not found`,
      },
    };
  }

  return {
    data: category,
  };
}

/**
 * Create a new category (root or subcategory)
 * POST /api/v1/categories
 *
 * Required Permission: CATEGORY_CREATE
 *
 * @example
 * ```ts
 * // Create root category
 * const rootResult = await categoryApi.createCategory({
 *   name: 'Electronics',
 *   slug: 'electronics',
 *   description: 'Electronic products and gadgets',
 *   parentId: null
 * });
 *
 * // Create subcategory
 * const subResult = await categoryApi.createCategory({
 *   name: 'Smartphones',
 *   slug: 'smartphones',
 *   description: 'Mobile phones and accessories',
 *   parentId: '100' // Electronics category
 * });
 * ```
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<ApiResult<CategoryResponse>> {
  return apiClient.post<CategoryResponse>("categories", data);
}

/**
 * Update category information (name, description, parent)
 * PUT /api/v1/categories/{id}
 *
 * Required Permission: CATEGORY_UPDATE
 *
 * Note:
 * - Slug is auto-generated from name by backend
 * - Does NOT update status (use updateCategoryStatus instead)
 *
 * @example
 * ```ts
 * const result = await categoryApi.updateCategory('100', {
 *   name: 'Consumer Electronics',
 *   description: 'Updated description',
 *   parentId: null
 * });
 * ```
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<ApiResult<CategoryResponse>> {
  return apiClient.put<CategoryResponse>(`categories/${id}`, data);
}

/**
 * Toggle category active/inactive status
 * PATCH /api/v1/categories/{id}/status
 *
 * Required Permission: CATEGORY_UPDATE
 *
 * @example
 * ```ts
 * // Deactivate category
 * const result = await categoryApi.updateCategoryStatus('100', {
 *   isActive: false
 * });
 * ```
 */
export async function updateCategoryStatus(
  id: string,
  data: UpdateCategoryStatusRequest
): Promise<ApiResult<CategoryResponse>> {
  return apiClient.patch<CategoryResponse>(`categories/${id}/status`, data);
}

/**
 * Delete category
 * DELETE /api/v1/categories/{id}
 *
 * Required Permission: CATEGORY_DELETE
 *
 * Important:
 * - Fails if category has children
 * - Fails if category has associated products
 *
 * @example
 * ```ts
 * const result = await categoryApi.deleteCategory('100');
 * ```
 */
export async function deleteCategory(id: string): Promise<ApiResult<void>> {
  return apiClient.delete<void>(`categories/${id}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get root categories (top-level categories with no parent)
 */
export async function getRootCategories(): Promise<
  ApiResult<CategoryResponse[]>
> {
  const result = await getAllCategories();

  if (!result.data) {
    return result;
  }

  // Root categories are already at top level in the tree
  return {
    data: result.data,
  };
}

/**
 * Get subcategories of a specific category
 */
export async function getSubcategories(
  parentId: string
): Promise<ApiResult<CategoryResponse[]>> {
  const categoryResult = await getCategoryById(parentId);

  if (!categoryResult.data) {
    return {
      error: categoryResult.error,
    };
  }

  return {
    data: categoryResult.data.children || [],
  };
}

/**
 * Flatten category tree into a list with depth levels
 * Useful for dropdown/select components
 */
export function flattenCategories(
  categories: CategoryResponse[],
  level: number = 0
): Array<CategoryResponse & { level: number }> {
  const result: Array<CategoryResponse & { level: number }> = [];

  for (const category of categories) {
    result.push({ ...category, level });

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, level + 1));
    }
  }

  return result;
}

/**
 * Build category breadcrumb path
 * Returns array of categories from root to target category
 */
export async function getCategoryBreadcrumb(
  categoryId: string
): Promise<ApiResult<CategoryResponse[]>> {
  const allCategoriesResult = await getAllCategories();

  if (!allCategoriesResult.data) {
    return {
      error: allCategoriesResult.error,
    };
  }

  // Recursively find path to category
  const findPath = (
    categories: CategoryResponse[],
    targetId: string,
    currentPath: CategoryResponse[] = []
  ): CategoryResponse[] | null => {
    for (const category of categories) {
      const newPath = [...currentPath, category];

      if (category.id === targetId) {
        return newPath;
      }

      if (category.children && category.children.length > 0) {
        const found = findPath(category.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  const path = findPath(allCategoriesResult.data, categoryId);

  if (!path) {
    return {
      error: {
        code: "NOT_FOUND",
        message: `Category with ID ${categoryId} not found`,
      },
    };
  }

  return {
    data: path,
  };
}

/**
 * Check if category has children
 */
export function hasChildren(category: CategoryResponse): boolean {
  return category.children && category.children.length > 0;
}

/**
 * Count total categories (including nested)
 */
export function countCategories(categories: CategoryResponse[]): number {
  let count = categories.length;

  for (const category of categories) {
    if (category.children && category.children.length > 0) {
      count += countCategories(category.children);
    }
  }

  return count;
}

/**
 * Find category by predicate
 */
export function findCategory(
  categories: CategoryResponse[],
  predicate: (category: CategoryResponse) => boolean
): CategoryResponse | null {
  for (const category of categories) {
    if (predicate(category)) {
      return category;
    }

    if (category.children && category.children.length > 0) {
      const found = findCategory(category.children, predicate);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Filter categories by predicate (returns flat list)
 */
export function filterCategories(
  categories: CategoryResponse[],
  predicate: (category: CategoryResponse) => boolean
): CategoryResponse[] {
  const result: CategoryResponse[] = [];

  for (const category of categories) {
    if (predicate(category)) {
      result.push(category);
    }

    if (category.children && category.children.length > 0) {
      result.push(...filterCategories(category.children, predicate));
    }
  }

  return result;
}

/**
 * Get active categories only
 */
export function getActiveCategories(
  categories: CategoryResponse[]
): CategoryResponse[] {
  return filterCategories(categories, (cat) => cat.isActive);
}

/**
 * Sort categories by name
 */
export function sortCategoriesByName(
  categories: CategoryResponse[]
): CategoryResponse[] {
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return sorted.map((category) => ({
    ...category,
    children: category.children ? sortCategoriesByName(category.children) : [],
  }));
}

// Export as default object for cleaner imports
export const categoryApi = {
  // CRUD operations
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,

  // Utility functions
  getRootCategories,
  getSubcategories,
  flattenCategories,
  getCategoryBreadcrumb,
  hasChildren,
  countCategories,
  findCategory,
  filterCategories,
  getActiveCategories,
  sortCategoriesByName,
};

export default categoryApi;
