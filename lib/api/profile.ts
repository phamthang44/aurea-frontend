/**
 * Profile API Service
 * 
 * All API endpoints are defined as constants for easy future modification
 * when the Spring Boot backend is ready.
 */

import { getOrCreateGuestId } from '@/lib/utils/guestId';
import type {
  UserProfile,
  UpdateProfileRequest,
  UserAddress,
  AddressRequest,
  ChangePasswordRequest,
  SecuritySettings,
  UserVoucher,
  ProfileApiResponse,
} from '@/lib/types/profile';
import i18n from '@/i18n';

// ============================================
// API ENDPOINT CONSTANTS
// Change these when backend is ready
// ============================================
export const PROFILE_API_ENDPOINTS = {
  GET_PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  UPLOAD_FILE: '/files',
  UPLOAD_AVATAR: '/users/avatar',
  GET_ADDRESSES: '/users/addresses',
  CREATE_ADDRESS: '/users/addresses',
  UPDATE_ADDRESS: (id: string) => `/users/addresses/${id}`,
  DELETE_ADDRESS: (id: string) => `/users/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/users/addresses/${id}/default`,
  CHANGE_PASSWORD: '/auth/change-password',
  GET_SECURITY_SETTINGS: '/auth/security',
  TOGGLE_2FA: '/auth/2fa',
  GET_VOUCHERS: '/users/vouchers',
} as const;

// ============================================
// MOCK DATA (Remove when backend is ready)
// ============================================
const MOCK_PROFILE: UserProfile = {
  id: '1234567890123456789',
  email: 'john.doe@example.com',
  fullName: 'John Doe',
  phoneNumber: '+84 912 345 678',
  avatarUrl: undefined,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
};

const MOCK_ADDRESSES: UserAddress[] = [
  {
    id: '1',
    type: 'HOME',
    recipientName: 'John Doe',
    phoneNumber: '+84 912 345 678',
    addressLine1: '123 Nguyen Hue Street',
    addressLine2: 'Apartment 4B',
    ward: 'Ben Nghe Ward',
    district: 'District 1',
    city: 'Ho Chi Minh City',
    postalCode: '700000',
    isDefault: true,
  },
  {
    id: '2',
    type: 'OFFICE',
    label: 'Main Office',
    recipientName: 'John Doe',
    phoneNumber: '+84 912 345 678',
    addressLine1: '456 Le Loi Boulevard',
    addressLine2: 'Floor 10, Bitexco Tower',
    district: 'District 1',
    city: 'Ho Chi Minh City',
    postalCode: '700000',
    isDefault: false,
  },
];

const MOCK_SECURITY: SecuritySettings = {
  twoFactorEnabled: false,
  lastPasswordChange: '2024-01-10T08:00:00Z',
};

const MOCK_VOUCHERS: UserVoucher[] = [
  {
    id: 'v1',
    code: 'WELCOME20',
    description: 'Welcome discount - 20% off your first order',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValue: 200000,
    maxDiscount: 100000,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isUsed: false,
  },
  {
    id: 'v2',
    code: 'FREESHIP50K',
    description: 'Free shipping for orders over 500K',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    minOrderValue: 500000,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-06-30T23:59:59Z',
    isUsed: false,
  },
];

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK_DATA = false;

// ============================================
// API HELPER FUNCTIONS
// ============================================
const API_BASE_URL = '/api/proxy';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ProfileApiResponse<T>> {
  const { params, ...init } = options;

  // Build URL with params
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Prepare headers
  const headers = new Headers(init.headers);
  
  // Add Auth Token
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Add Guest ID
  const guestId = getOrCreateGuestId();
  if (guestId) {
    headers.set('X-Guest-ID', guestId);
  }

  // Add Language
  // Use resolved language or default
  const lang = i18n.resolvedLanguage || i18n.language || 'vi';
  headers.set('Accept-Language', lang);

  // Set Content-Type if not FormData
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers,
    });

    // Handle 401 (Unauthorized)
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth')) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          // Optional: Clear other auth data
          // Redirect to login
          window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
          
          // Return a specific error wrapper that usually components can ignore 
          // or handle specially, preventing the generic "Token is invalid" toast
          return {
            error: {
              code: 'SESSION_EXPIRED',
              message: 'Session expired. Please sign in again.',
            },
          };
        }
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data?.error?.message || response.statusText,
          code: data?.error?.code || String(response.status),
        },
      };
    }

    return { data: data.data || data };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

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
  return fetchWithAuth<UserProfile>(PROFILE_API_ENDPOINTS.GET_PROFILE);
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ProfileApiResponse<UserProfile>> {
  if (USE_MOCK_DATA) {
    const updated = { ...MOCK_PROFILE, ...data, updatedAt: new Date().toISOString() };
    return { data: updated };
  }
  return fetchWithAuth<UserProfile>(PROFILE_API_ENDPOINTS.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Upload file to get URL (FileController)
 */
export async function uploadFile(
  file: File
): Promise<ProfileApiResponse<string>> {
  if (USE_MOCK_DATA) {
     // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: URL.createObjectURL(file) };
  }

  const formData = new FormData();
  formData.append('file', file);

  // FileController returns ApiResult<String> which maps to { data: string }
  return fetchWithAuth<string>(PROFILE_API_ENDPOINTS.UPLOAD_FILE, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload avatar image (Legacy/Direct)
 */
export async function uploadAvatar(
  file: File
): Promise<ProfileApiResponse<{ avatarUrl: string }>> {
  if (USE_MOCK_DATA) {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { avatarUrl: URL.createObjectURL(file) } };
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  return fetchWithAuth<{ avatarUrl: string }>(PROFILE_API_ENDPOINTS.UPLOAD_AVATAR, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Get user addresses
 */
export async function getAddresses(): Promise<ProfileApiResponse<UserAddress[]>> {
  if (USE_MOCK_DATA) {
    return { data: MOCK_ADDRESSES };
  }
  return fetchWithAuth<UserAddress[]>(PROFILE_API_ENDPOINTS.GET_ADDRESSES);
}

/**
 * Create new address
 */
export async function createAddress(
  data: AddressRequest
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
  return fetchWithAuth<UserAddress>(PROFILE_API_ENDPOINTS.CREATE_ADDRESS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update existing address
 */
export async function updateAddress(
  id: string,
  data: AddressRequest
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
    return { error: { code: 'NOT_FOUND', message: 'Address not found' } };
  }
  return fetchWithAuth<UserAddress>(PROFILE_API_ENDPOINTS.UPDATE_ADDRESS(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete address
 */
export async function deleteAddress(id: string): Promise<ProfileApiResponse<void>> {
  if (USE_MOCK_DATA) {
    const index = MOCK_ADDRESSES.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ADDRESSES.splice(index, 1);
      return { data: undefined };
    }
    return { error: { code: 'NOT_FOUND', message: 'Address not found' } };
  }
  return fetchWithAuth<void>(PROFILE_API_ENDPOINTS.DELETE_ADDRESS(id), {
    method: 'DELETE',
  });
}

/**
 * Set address as default
 */
export async function setDefaultAddress(
  id: string
): Promise<ProfileApiResponse<UserAddress>> {
  if (USE_MOCK_DATA) {
    // Clear previous default
    MOCK_ADDRESSES.forEach((a) => (a.isDefault = false));
    const address = MOCK_ADDRESSES.find((a) => a.id === id);
    if (address) {
      address.isDefault = true;
      return { data: address };
    }
    return { error: { code: 'NOT_FOUND', message: 'Address not found' } };
  }
  return fetchWithAuth<UserAddress>(PROFILE_API_ENDPOINTS.SET_DEFAULT_ADDRESS(id), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<ProfileApiResponse<SecuritySettings>> {
  if (USE_MOCK_DATA) {
    return { data: MOCK_SECURITY };
  }
  return fetchWithAuth<SecuritySettings>(PROFILE_API_ENDPOINTS.GET_SECURITY_SETTINGS);
}

/**
 * Change password
 */
export async function changePassword(
  data: ChangePasswordRequest
): Promise<ProfileApiResponse<void>> {
  if (USE_MOCK_DATA) {
    // Simulate validation
    if (data.currentPassword === 'wrong') {
      return { error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } };
    }
    if (data.newPassword !== data.confirmPassword) {
      return { error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' } };
    }
    return { data: undefined, meta: { message: 'Password changed successfully' } };
  }
  return fetchWithAuth<void>(PROFILE_API_ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Toggle two-factor authentication
 */
export async function toggle2FA(
  enable: boolean
): Promise<ProfileApiResponse<SecuritySettings>> {
  if (USE_MOCK_DATA) {
    MOCK_SECURITY.twoFactorEnabled = enable;
    return { data: MOCK_SECURITY };
  }
  return fetchWithAuth<SecuritySettings>(PROFILE_API_ENDPOINTS.TOGGLE_2FA, {
    method: 'POST',
    body: JSON.stringify({ enable }),
  });
}

/**
 * Get user vouchers
 */
export async function getUserVouchers(): Promise<ProfileApiResponse<UserVoucher[]>> {
  if (USE_MOCK_DATA) {
    return { data: MOCK_VOUCHERS };
  }
  return fetchWithAuth<UserVoucher[]>(PROFILE_API_ENDPOINTS.GET_VOUCHERS);
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
  getSecuritySettings,
  changePassword,
  toggleTwoFactor: toggle2FA,
  getUserVouchers,
  uploadFile,
};

export default profileApi;
