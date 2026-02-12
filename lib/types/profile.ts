/**
 * User Profile and Address Types
 *
 * IMPORTANT: All ID fields use `string` type because the backend uses TSID
 * (Time-Sorted Unique Identifier) which is a Long type in Java.
 */

// Address type enum (must match backend com.thang.aurea.common.enums.AddressType)
export type AddressType = "HOME" | "WORKSPACE" | "OFFICE" | "OTHER";

// User profile response from API
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  birthDate?: string; // ISO 8601 YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

// User profile update request
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  birthDate?: string;
}

// User contact address (ContactAddressResponse)
export interface UserAddress {
  id: string;
  recipientName: string;
  phoneNumber: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  districtName: string;
  detailAddress: string;
  fullAddress?: string;
  addressType: AddressType;
  isDefault: boolean;
  label?: string;
  notes?: string;
  createdAt?: string;
}

// Address create/update request (CreateAddressRequest)
export interface AddressRequest {
  recipientName: string;
  phoneNumber: string;
  provinceCode: string;
  provinceName: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  detailAddress: string;
  addressType: AddressType;
  isDefault: boolean;
  label?: string;
  notes?: string;
}

// User voucher (from staff promotions)
export interface UserVoucher {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
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
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
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
