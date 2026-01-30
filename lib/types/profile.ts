/**
 * User Profile and Address Types
 * 
 * IMPORTANT: All ID fields use `string` type because the backend uses TSID
 * (Time-Sorted Unique Identifier) which is a Long type in Java.
 */

// Address type enum
export type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

// User profile response from API
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string; // ISO 8601 YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

// User profile update request
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
}

// User address
export interface UserAddress {
  id: string;
  type: AddressType;
  label?: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  ward?: string;
  district: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Address create/update request
export interface AddressRequest {
  type: AddressType;
  label?: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  ward?: string;
  district: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User voucher (from staff promotions)
export interface UserVoucher {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isUsed: boolean;
}

// API Response wrappers
export interface ProfileApiResponse<T> {
  data?: T;
  meta?: {
    serverTime?: number;
    apiVersion?: string;
    traceId?: string;
    message?: string;
  };
  error?: {
    code?: string;
    message?: string;
    traceId?: string;
    details?: unknown;
  };
}
