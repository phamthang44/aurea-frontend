/**
 * TypeScript types based on Swagger API documentation
 *
 * IMPORTANT: All ID fields (userId, productId, categoryId, etc.) use `string` type
 * because the backend uses TSID (Time-Sorted Unique Identifier) which is a Long type in Java.
 * JavaScript's `number` type has a precision limit (Number.MAX_SAFE_INTEGER = 2^53 - 1),
 * so TSID values larger than this would lose precision if stored as numbers.
 * Always use `string` for IDs to prevent precision loss.
 */

export type AuthStatus =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OTP_SENT"
  | "OTP_VERIFIED"
  | "REQUIRE_REGISTRATION";

export interface AuthResponse {
  status: AuthStatus;
  accessToken?: string;
  refreshToken?: string;
  roles?: string[];
  permissions?: string[]; // NEW: Permission-based authorization
  registerToken?: string;
}

export interface ApiResultAuthResponse {
  data?: AuthResponse;
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

export interface ApiResultVoid {
  data?: unknown;
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

export interface OtpRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface RegisterFinishRequest {
  email: string;
  password: string;
  fullName: string;
  registerToken: string;
}
