/**
 * Location API Service
 * Handles Province and Ward data fetching for address forms
 */

import apiClient from "../api-client";

// ============================================================================
// Types
// ============================================================================

export interface ProvinceResponse {
  code: string;
  name: string;
  fullName: string;
  nameEn?: string;
  fullNameEn?: string;
}

export interface WardResponse {
  code: string;
  name: string;
  fullName: string;
  provinceCode: string;
  nameEn?: string;
  fullNameEn?: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all provinces
 * GET /api/v1/locations/provinces
 *
 * @example
 * ```ts
 * const result = await locationApi.getAllProvinces();
 * if (result.data) {
 *   const provinces = result.data;
 * }
 * ```
 */
export async function getAllProvinces(): Promise<
  ApiResult<ProvinceResponse[]>
> {
  return apiClient.get<ProvinceResponse[]>("locations/provinces");
}

/**
 * Get wards by province code
 * GET /api/v1/locations/wards?provinceCode={code}
 *
 * @example
 * ```ts
 * const result = await locationApi.getWardsByProvince('79');
 * if (result.data) {
 *   const wards = result.data;
 * }
 * ```
 */
export async function getWardsByProvince(
  provinceCode: string
): Promise<ApiResult<WardResponse[]>> {
  return apiClient.get<WardResponse[]>(
    `locations/wards?provinceCode=${encodeURIComponent(provinceCode)}`
  );
}

// ============================================================================
// Export as default object for cleaner imports
// ============================================================================

export const locationApi = {
  getAllProvinces,
  getWardsByProvince,
};

export default locationApi;

