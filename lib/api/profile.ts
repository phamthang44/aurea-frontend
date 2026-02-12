/**
 * Profile API Service
 *
 * All API endpoints are defined as constants for easy future modification
 * when the Spring Boot backend is ready.
 */

import fetchClient from "@/lib/fetch-client";
import type {
  UserProfile,
  UpdateProfileRequest,
  UserAddress,
  AddressRequest,
  UserVoucher,
  ProfileApiResponse,
} from "@/lib/types/profile";

// ============================================
// API ENDPOINT CONSTANTS
// Change these when backend is ready
// ============================================
export const PROFILE_API_ENDPOINTS = {
  GET_PROFILE: "users/me",
  UPDATE_PROFILE: "users/me",
  UPLOAD_FILE: "files",
  UPLOAD_AVATAR: "users/avatar",
  // Contact addresses
  GET_ADDRESSES: "addresses/me",
  CREATE_ADDRESS: "addresses",
  UPDATE_ADDRESS: (id: string) => `addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `addresses/${id}`,

  GET_VOUCHERS: "users/vouchers",
} as const;

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ProfileApiResponse<UserProfile>> {
  return fetchClient.get<UserProfile>(PROFILE_API_ENDPOINTS.GET_PROFILE);
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<ProfileApiResponse<UserProfile>> {
  return fetchClient.put<UserProfile>(
    PROFILE_API_ENDPOINTS.UPDATE_PROFILE,
    data,
  );
}

/**
 * Upload file to get URL (FileController)
 */
export async function uploadFile(
  file: File,
): Promise<ProfileApiResponse<string>> {
  const formData = new FormData();
  formData.append("file", file);
  return fetchClient.post<string>(PROFILE_API_ENDPOINTS.UPLOAD_FILE, formData);
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  file: File,
): Promise<ProfileApiResponse<{ avatarUrl: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  return fetchClient.post<{ avatarUrl: string }>(
    PROFILE_API_ENDPOINTS.UPLOAD_AVATAR,
    formData,
  );
}

/**
 * Get user addresses
 */
export async function getAddresses(): Promise<
  ProfileApiResponse<UserAddress[]>
> {
  return fetchClient.get<UserAddress[]>(PROFILE_API_ENDPOINTS.GET_ADDRESSES);
}

/**
 * Create new address
 */
export async function createAddress(
  data: AddressRequest,
): Promise<ProfileApiResponse<UserAddress>> {
  return fetchClient.post<UserAddress>(
    PROFILE_API_ENDPOINTS.CREATE_ADDRESS,
    data,
  );
}

/**
 * Update existing address
 */
export async function updateAddress(
  id: string,
  data: AddressRequest,
): Promise<ProfileApiResponse<UserAddress>> {
  return fetchClient.put<UserAddress>(
    PROFILE_API_ENDPOINTS.UPDATE_ADDRESS(id),
    data,
  );
}

/**
 * Delete address
 */
export async function deleteAddress(
  id: string,
): Promise<ProfileApiResponse<void>> {
  return fetchClient.delete<void>(PROFILE_API_ENDPOINTS.DELETE_ADDRESS(id));
}

/**
 * Get user vouchers
 */
export async function getUserVouchers(): Promise<
  ProfileApiResponse<UserVoucher[]>
> {
  return fetchClient.get<UserVoucher[]>(PROFILE_API_ENDPOINTS.GET_VOUCHERS);
}

// Export all functions as a namespace object
export const profileApi = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,

  getUserVouchers,
  uploadFile,
};

export default profileApi;
