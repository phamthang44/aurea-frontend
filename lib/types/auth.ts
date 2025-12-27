/**
 * TypeScript types based on Swagger API documentation
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

