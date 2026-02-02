/**
 * Import API Service
 * Based on import-api-guide.md
 * Uses the native fetch client from lib/fetch-client.ts
 */

import fetchClient from "../fetch-client";
import type {
  ImportJob,
  ImportJobListParams,
  PagedImportJobs,
  ImportApiResponse,
  UploadImportResponse,
} from "../types/import";

// ============================================================================
// Import Operations
// ============================================================================

/**
 * Upload CSV file for product import
 * POST /api/v1/imports/internal/products
 *
 * @example
 * ```ts
 * const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
 * const result = await importApi.uploadProductCSV(file);
 * if (result.data) {
 *   // Backend returns { code, message, data: jobId }
 *   // API client wraps it, so result.data = { code, message, data: jobId }
 *   const jobId = result.data.data;
 *   console.log('Job started:', jobId);
 * }
 * ```
 */
export async function uploadProductCSV(
  file: File,
): Promise<{
  data?: ImportApiResponse<number>;
  error?: { message?: string; code?: string };
}> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchClient.post<ImportApiResponse<number>>(
    "imports/internal/products",
    formData,
  );
}

/**
 * Get import job by ID
 * GET /api/v1/imports/{jobId}
 *
 * @example
 * ```ts
 * const result = await importApi.getImportJob(17);
 * if (result.data) {
 *   const job = result.data.data; // Backend returns { code, message, data: ImportJob }
 *   console.log('Job status:', job.status);
 * }
 * ```
 */
export async function getImportJob(
  jobId: number,
): Promise<{
  data?: ImportApiResponse<ImportJob>;
  error?: { message?: string; code?: string };
}> {
  return fetchClient.get<ImportApiResponse<ImportJob>>(`imports/${jobId}`);
}

/**
 * Get import job status (alias for getImportJob)
 * GET /api/v1/imports/{jobId}/status
 */
export async function getImportJobStatus(
  jobId: number,
): Promise<{
  data?: ImportApiResponse<ImportJob>;
  error?: { message?: string; code?: string };
}> {
  return fetchClient.get<ImportApiResponse<ImportJob>>(
    `imports/${jobId}/status`,
  );
}

/**
 * List import jobs with pagination and filtering
 * GET /api/v1/imports
 *
 * @example
 * ```ts
 * const result = await importApi.listImportJobs({
 *   status: 'FAILED',
 *   page: 0,
 *   size: 20,
 *   sort: 'createdAt,desc'
 * });
 * if (result.data) {
 *   const pagedJobs = result.data.data; // Backend returns { code, message, data: PagedImportJobs }
 *   console.log('Total jobs:', pagedJobs.totalElements);
 * }
 * ```
 */
export async function listImportJobs(
  params?: ImportJobListParams,
): Promise<{
  data?: ImportApiResponse<PagedImportJobs>;
  error?: { message?: string; code?: string };
}> {
  const queryParams: Record<string, string | number | undefined> = {
    sort: params?.sort || "createdAt,desc",
  };
  if (params?.status) queryParams.status = params.status;
  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.size) queryParams.size = params.size;

  return fetchClient.get<ImportApiResponse<PagedImportJobs>>("imports", {
    params: queryParams,
  });
}

/**
 * Cancel a pending import job
 * DELETE /api/v1/imports/{jobId}
 *
 * @example
 * ```ts
 * const result = await importApi.cancelImportJob(17);
 * if (result.data) {
 *   console.log('Job cancelled');
 * }
 * ```
 */
export async function cancelImportJob(
  jobId: number,
): Promise<{
  data?: ImportApiResponse<null>;
  error?: { message?: string; code?: string };
}> {
  return fetchClient.delete<ImportApiResponse<null>>(`imports/${jobId}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Poll job status until completion
 * Polls every 2 seconds until job reaches a terminal state
 *
 * @example
 * ```ts
 * const job = await importApi.waitForJobCompletion(17);
 * console.log('Job finished:', job.status);
 * ```
 */
export async function waitForJobCompletion(
  jobId: number,
  pollInterval: number = 2000,
): Promise<ImportJob> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await getImportJob(jobId);

        if (result.error) {
          clearInterval(interval);
          reject(new Error(result.error.message || "Failed to get job status"));
          return;
        }

        if (!result.data?.data) {
          clearInterval(interval);
          reject(new Error("No job data in response"));
          return;
        }

        const job = result.data.data;

        // Check if job is finished
        if (["COMPLETED", "FAILED", "PARTIAL_SUCCESS"].includes(job.status)) {
          clearInterval(interval);
          resolve(job);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, pollInterval);
  });
}

// Export as default object for cleaner imports
export const importApi = {
  uploadProductCSV,
  getImportJob,
  getImportJobStatus,
  listImportJobs,
  cancelImportJob,
  waitForJobCompletion,
};

export default importApi;
