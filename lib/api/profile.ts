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
  GET_ADDRESSES: "users/addresses",
  CREATE_ADDRESS: "users/addresses",
  UPDATE_ADDRESS: (id: string) => `users/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `users/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `users/addresses/${id}/default`,

  GET_VOUCHERS: "users/vouchers",
} as const;

// ============================================
// MOCK DATA (Remove when backend is ready)
// ============================================
const MOCK_PROFILE: UserProfile = {
  id: "1234567890123456789",
  email: "john.doe@example.com",
  fullName: "John Doe",
  phoneNumber: "+84 912 345 678",
  avatarUrl: undefined,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
};

const MOCK_ADDRESSES: UserAddress[] = [
  {
    id: "1",
    type: "HOME",
    recipientName: "John Doe",
    phoneNumber: "+84 912 345 678",
    addressLine1: "123 Nguyen Hue Street",
    addressLine2: "Apartment 4B",
    ward: "Ben Nghe Ward",
    district: "District 1",
    city: "Ho Chi Minh City",
    postalCode: "700000",
    isDefault: true,
  },
  {
    id: "2",
    type: "OFFICE",
    label: "Main Office",
    recipientName: "John Doe",
    phoneNumber: "+84 912 345 678",
    addressLine1: "456 Le Loi Boulevard",
    addressLine2: "Floor 10, Bitexco Tower",
    district: "District 1",
    city: "Ho Chi Minh City",
    postalCode: "700000",
    isDefault: false,
  },
];

const MOCK_VOUCHERS: UserVoucher[] = [
  {
    id: "v1",
    code: "WELCOME20",
    description: "Welcome discount - 20% off your first order",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 200000,
    maxDiscount: 100000,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    isUsed: false,
  },
  {
    id: "v2",
    code: "FREESHIP50K",
    description: "Free shipping for orders over 500K",
    discountType: "FIXED_AMOUNT",
    discountValue: 50000,
    minOrderValue: 500000,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-06-30T23:59:59Z",
    isUsed: false,
  },
];

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK_DATA = false;

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ProfileApiResponse<UserProfile>> {
  if (USE_MOCK_DATA) {
    return { data: MOCK_PROFILE };
  }
  return fetchClient.get<UserProfile>(PROFILE_API_ENDPOINTS.GET_PROFILE);
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<ProfileApiResponse<UserProfile>> {
  if (USE_MOCK_DATA) {
    const updated = {
      ...MOCK_PROFILE,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { data: updated };
  }
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
  if (USE_MOCK_DATA) {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: URL.createObjectURL(file) };
  }

  const formData = new FormData();
  formData.append("file", file);

  // FileController returns ApiResult<String> which maps to { data: string }
  return fetchClient.post<string>(PROFILE_API_ENDPOINTS.UPLOAD_FILE, formData);
}

/**
 * Upload avatar image (Legacy/Direct)
 */
export async function uploadAvatar(
  file: File,
): Promise<ProfileApiResponse<{ avatarUrl: string }>> {
  if (USE_MOCK_DATA) {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { avatarUrl: URL.createObjectURL(file) } };
  }

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
  if (USE_MOCK_DATA) {
    return { data: MOCK_ADDRESSES };
  }
  return fetchClient.get<UserAddress[]>(PROFILE_API_ENDPOINTS.GET_ADDRESSES);
}

/**
 * Create new address
 */
export async function createAddress(
  data: AddressRequest,
): Promise<ProfileApiResponse<UserAddress>> {
  if (USE_MOCK_DATA) {
    const newAddress: UserAddress = {
      ...data,
      id: Date.now().toString(),
      isDefault: data.isDefault || false,
      createdAt: new Date().toISOString(),
    };
    MOCK_ADDRESSES.push(newAddress);
    return { data: newAddress };
  }
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
  if (USE_MOCK_DATA) {
    const index = MOCK_ADDRESSES.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ADDRESSES[index] = {
        ...MOCK_ADDRESSES[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { data: MOCK_ADDRESSES[index] };
    }
    return { error: { code: "NOT_FOUND", message: "Address not found" } };
  }
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
  if (USE_MOCK_DATA) {
    const index = MOCK_ADDRESSES.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ADDRESSES.splice(index, 1);
      return { data: undefined };
    }
    return { error: { code: "NOT_FOUND", message: "Address not found" } };
  }
  return fetchClient.delete<void>(PROFILE_API_ENDPOINTS.DELETE_ADDRESS(id));
}

/**
 * Set address as default
 */
export async function setDefaultAddress(
  id: string,
): Promise<ProfileApiResponse<UserAddress>> {
  if (USE_MOCK_DATA) {
    // Clear previous default
    MOCK_ADDRESSES.forEach((a) => (a.isDefault = false));
    const address = MOCK_ADDRESSES.find((a) => a.id === id);
    if (address) {
      address.isDefault = true;
      return { data: address };
    }
    return { error: { code: "NOT_FOUND", message: "Address not found" } };
  }
  return fetchClient.post<UserAddress>(
    PROFILE_API_ENDPOINTS.SET_DEFAULT_ADDRESS(id),
    {},
  );
}

/**
 * Get user vouchers
 */
export async function getUserVouchers(): Promise<
  ProfileApiResponse<UserVoucher[]>
> {
  if (USE_MOCK_DATA) {
    return { data: MOCK_VOUCHERS };
  }
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
  setDefaultAddress,

  getUserVouchers,
  uploadFile,
};

export default profileApi;
