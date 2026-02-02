/**
 * Client-side API client using native Fetch API
 * Best practice for Next.js - compatible with server components and edge runtime
 * All requests go through Next.js API proxy routes which handle authentication via HttpOnly cookies
 *
 * Features:
 * - Automatic token refresh on 401/token errors
 * - Request queue to prevent multiple concurrent refresh calls
 * - Support for JSON, FormData, and other content types
 * - Automatic headers (Authorization, Accept-Language, X-Guest-ID)
 * - TypeScript support with generics
 */

import I18nUtils from "../i18n";
import { getOrCreateGuestId } from "./utils/guestId";

const API_BASE_URL = "/api/proxy";

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  error?: {
    message?: string;
    code?: string;
  };
}

export interface FetchClientConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
  /**
   * Skip automatic token refresh on error
   * Useful for auth endpoints like login/logout
   */
  skipAuthRefresh?: boolean;
}

// Error codes that indicate token issues and should trigger refresh
const TOKEN_ERROR_CODES = ["AUTH_003", "AUTH_004"]; // TOKEN_EXPIRED, TOKEN_INVALID
const TOKEN_ERROR_MESSAGES = [
  "token has expired",
  "token is invalid",
  "token expired",
  "invalid token",
  "token không hợp lệ",
  "token đã hết hạn",
];

// ============================================================================
// Token Refresh Queue
// Prevents multiple concurrent refresh calls when multiple requests fail
// ============================================================================

class RefreshTokenQueue {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  addToQueue(
    resolve: (value?: any) => void,
    reject: (error?: any) => void,
  ): void {
    this.failedQueue.push({ resolve, reject });
  }

  processQueue(error: Error | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    this.failedQueue = [];
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }
}

const refreshTokenQueue = new RefreshTokenQueue();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an error response indicates a token issue
 */
function isTokenError(
  status: number,
  errorCode?: string,
  errorMessage?: string,
): boolean {
  if (status === 401) return true;
  if (errorCode && TOKEN_ERROR_CODES.includes(errorCode)) return true;
  if (errorMessage) {
    const lowerMessage = errorMessage.toLowerCase();
    return TOKEN_ERROR_MESSAGES.some((msg) =>
      lowerMessage.includes(msg.toLowerCase()),
    );
  }
  return false;
}

/**
 * Attempt to refresh the access token
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      // If the new access token is returned in the response body, store it
      if (data?.data?.accessToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.data.accessToken);
      }
      if (process.env.NODE_ENV === "development") {
        console.log("[Fetch Client] Token refreshed successfully");
      }
      return true;
    }
    return false;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Fetch Client] Token refresh failed:", error);
    }
    return false;
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  // Ensure path doesn't start with /api/proxy if it's already included
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(
    `${API_BASE_URL}/${normalizedPath}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Prepare request headers
 */
function prepareHeaders(
  customHeaders?: HeadersInit,
  isFormData?: boolean,
): Headers {
  const headers = new Headers(customHeaders);

  // Add Auth Token from localStorage (client-side only)
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  // Add Guest ID for hybrid cart support
  const guestId = getOrCreateGuestId();
  if (guestId && !headers.has("X-Guest-ID")) {
    headers.set("X-Guest-ID", guestId);
  }

  // Add Accept-Language for i18n
  const lang = I18nUtils.resolvedLanguage || I18nUtils.language || "vi";
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", lang);
  }

  // Set Content-Type for JSON (skip for FormData - browser sets it with boundary)
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * Handle redirect to auth page
 */
function handleAuthRedirect(): void {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const isPublicRoute =
      currentPath === "/" ||
      currentPath.startsWith("/shop") ||
      currentPath.startsWith("/product/") ||
      currentPath.startsWith("/cart") ||
      currentPath.startsWith("/auth") ||
      currentPath.startsWith("/forgot-password") ||
      currentPath.startsWith("/reset-password");

    if (!isPublicRoute && !currentPath.startsWith("/auth")) {
      localStorage.removeItem("accessToken");
      window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

// ============================================================================
// Main Fetch Client Class
// ============================================================================

class FetchClient {
  /**
   * Core request method with automatic token refresh
   */
  private async request<T>(
    path: string,
    config: FetchClientConfig = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const {
      params,
      body,
      headers: customHeaders,
      skipAuthRefresh = false,
      ...fetchConfig
    } = config;

    const isFormData = body instanceof FormData;
    const url = buildUrl(path, params);
    const headers = prepareHeaders(customHeaders, isFormData);

    // Prepare body
    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (isFormData) {
        requestBody = body;
      } else if (typeof body === "object") {
        requestBody = JSON.stringify(body);
      } else {
        requestBody = body;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        body: requestBody,
        credentials: "include", // Include cookies
      });

      // Try to parse JSON response
      let data: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          // Response is not valid JSON
        }
      }

      // Check for token errors
      const errorCode = data?.error?.code;
      const errorMessage = data?.error?.message;

      if (
        !isRetry &&
        !skipAuthRefresh &&
        isTokenError(response.status, errorCode, errorMessage)
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Fetch Client] Token error detected:", {
            status: response.status,
            errorCode,
            errorMessage,
          });
        }

        // Handle token refresh with queue
        if (refreshTokenQueue.getIsRefreshing()) {
          // Wait for ongoing refresh
          return new Promise((resolve, reject) => {
            refreshTokenQueue.addToQueue(
              () => resolve(this.request<T>(path, config, true)),
              reject,
            );
          });
        }

        // Start refresh process
        refreshTokenQueue.setIsRefreshing(true);

        try {
          const refreshed = await refreshToken();

          if (refreshed) {
            refreshTokenQueue.processQueue();
            // Retry the original request
            return this.request<T>(path, config, true);
          } else {
            refreshTokenQueue.processQueue(new Error("Token refresh failed"));
            handleAuthRedirect();

            return {
              error: {
                code: "SESSION_EXPIRED",
                message: "Session expired. Please sign in again.",
              },
            };
          }
        } finally {
          refreshTokenQueue.setIsRefreshing(false);
        }
      }

      // Handle error response
      if (!response.ok || data?.error) {
        return {
          error: {
            message:
              data?.error?.message || response.statusText || "Request failed",
            code: data?.error?.code || String(response.status),
          },
        };
      }

      // Return successful response
      // Handle nested data structure: { data: { ... }, meta: {...} } or { ... }
      return {
        data: data?.data !== undefined ? data.data : data,
        meta: data?.meta,
      };
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Fetch Client] Request error:", error);
      }

      return {
        error: {
          message: error.message || "Network error",
          code: "NETWORK_ERROR",
        },
      };
    }
  }

  // HTTP Methods
  async get<T>(
    path: string,
    config?: FetchClientConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "GET" });
  }

  async post<T>(
    path: string,
    body?: any,
    config?: FetchClientConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "POST", body });
  }

  async put<T>(
    path: string,
    body?: any,
    config?: FetchClientConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "PUT", body });
  }

  async patch<T>(
    path: string,
    body?: any,
    config?: FetchClientConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "PATCH", body });
  }

  async delete<T>(
    path: string,
    config?: FetchClientConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "DELETE" });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

const fetchClient = new FetchClient();

export default fetchClient;

// Also export the class for custom instances
export { FetchClient };
