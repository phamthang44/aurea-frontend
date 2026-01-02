/**
 * TypeScript types for Product Import API
 * Based on import-api-guide.md
 */

// ============================================================================
// Import Job Types
// ============================================================================

/**
 * Import job status values
 */
export type ImportStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL_SUCCESS";

/**
 * Import job type
 */
export type ImportJobType = "PRODUCT_IMPORT";

/**
 * Import job response from backend
 * GET /api/v1/imports/{jobId}
 */
export interface ImportJob {
  id: number;
  type: ImportJobType;
  fileUrl: string;
  status: ImportStatus;
  totalRecords?: number;
  successCount?: number;
  errorCount?: number;
  errorLogUrl?: string | null;
  message?: string;
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Backend API response wrapper
 * All endpoints return this structure
 */
export interface ImportApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Paginated response for import jobs list
 * GET /api/v1/imports
 */
export interface PagedImportJobs {
  content: ImportJob[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Query parameters for listing import jobs
 */
export interface ImportJobListParams {
  status?: ImportStatus;
  page?: number; // 0-indexed
  size?: number; // Default: 20, max: 100
  sort?: string; // Format: "field,direction" (e.g., "createdAt,desc")
}

/**
 * Upload CSV file response
 * POST /api/v1/imports/internal/products
 * Returns job ID
 */
export interface UploadImportResponse {
  jobId: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if job is in a terminal state (finished)
 */
export function isJobFinished(status: ImportStatus): boolean {
  return ["COMPLETED", "FAILED", "PARTIAL_SUCCESS"].includes(status);
}

/**
 * Check if job can be cancelled
 */
export function canCancelJob(status: ImportStatus): boolean {
  return status === "PENDING";
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: ImportStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "PROCESSING":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    case "FAILED":
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    case "PARTIAL_SUCCESS":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
  }
}

/**
 * Format status for display
 */
export function formatStatus(status: ImportStatus): string {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PROCESSING":
      return "Processing";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "PARTIAL_SUCCESS":
      return "Partial Success";
    default:
      return status;
  }
}

