/**
 * Server-side API client with Axios
 * Implements automatic token refresh for Server Actions
 * Works within Next.js Server environment using cookies from next/headers
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { cookies } from "next/headers";
import type { ApiResultAuthResponse } from "@/lib/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RefreshTokenResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    roles?: string[];
  };
  error?: {
    message?: string;
    code?: string;
  };
}

/**
 * Process queue to handle multiple simultaneous 401 errors on server
 * Prevents multiple refresh token requests when multiple server actions fail at once
 */
class ServerRefreshTokenQueue {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  addToQueue(resolve: (value?: any) => void, reject: (error?: any) => void) {
    this.failedQueue.push({ resolve, reject });
  }

  processQueue(error: AxiosError | null = null) {
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

  setIsRefreshing(value: boolean) {
    this.isRefreshing = value;
  }
}

const serverRefreshTokenQueue = new ServerRefreshTokenQueue();

/**
 * Helper to set auth cookies in server environment
 */
async function setAuthCookies(accessToken: string, refreshToken?: string) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  if (refreshToken) {
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

/**
 * Create server-side Axios instance with interceptors
 * Handles token refresh automatically for Server Actions
 */
function createServerAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Request Interceptor
   * Gets accessToken from cookies and attaches to Authorization header
   * Also includes refresh_token cookie in Cookie header for requests that need it
   * This is the server-side equivalent of withCredentials: true
   */
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        // Set Authorization header with access token
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Include refresh_token cookie in Cookie header for requests that need it
        // This ensures cookies are sent to the backend (server-side equivalent of withCredentials)
        if (refreshToken) {
          // If Cookie header already exists, append to it; otherwise create new
          const existingCookie = config.headers.Cookie as string;
          if (existingCookie) {
            config.headers.Cookie = `${existingCookie}; refresh_token=${refreshToken}`;
          } else {
            config.headers.Cookie = `refresh_token=${refreshToken}`;
          }
        }
      } catch (error) {
        console.error("[Server API] Error getting token from cookies:", error);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * Handles 401 errors with automatic token refresh and retry
   */
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Only handle 401 Unauthorized errors
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        // If refresh is already in progress, queue this request
        if (serverRefreshTokenQueue.getIsRefreshing()) {
          return new Promise((resolve, reject) => {
            serverRefreshTokenQueue.addToQueue(() => {
              // Retry the original request after token refresh
              resolve(instance(originalRequest));
            }, reject);
          });
        }

        // Start the refresh process
        serverRefreshTokenQueue.setIsRefreshing(true);

        try {
          // Get refresh token from cookies
          const cookieStore = await cookies();
          const refreshToken = cookieStore.get("refresh_token")?.value;

          if (!refreshToken) {
            throw new Error("No refresh token found");
          }

          // Backend AuthController reads refresh token from cookie named "refresh_token"
          // But we store it as "refreshToken" cookie
          // We need to set a cookie with the correct name that the backend expects
          // Note: We can't set cookies in server actions that will be sent to external APIs
          // So we need to send it in a way the backend can read it
          // The backend reads from cookie, so we need to include it in the request

          // Create a temporary cookie store for this request
          // Since we're calling the backend directly, we need to send the cookie
          // Axios doesn't automatically send cookies to external APIs, so we need to use a cookie jar
          // OR we can use the Cookie header directly

          // Actually, the best approach is to use axios with a cookie jar or set the Cookie header
          // But axios in Node.js doesn't automatically handle cookies for external requests
          // We need to manually set the Cookie header
          const refreshResponse = await axios.post<ApiResultAuthResponse>(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                // Set the cookie header with the name the backend expects
                // Backend expects cookie named "refresh_token"
                Cookie: `refresh_token=${refreshToken}`,
              },
            }
          );

          const refreshData = refreshResponse.data;

          // Check if refresh was successful
          if (
            refreshResponse.status === 200 &&
            refreshData.data?.accessToken &&
            !refreshData.error
          ) {
            const authData = refreshData.data;
            const newAccessToken = authData.accessToken;
            const newRefreshToken = authData.refreshToken;

            if (!newAccessToken) {
              throw new Error("No access token in refresh response");
            }

            // Update cookies with new tokens
            // refreshToken is optional in response, only update if provided
            await setAuthCookies(newAccessToken, newRefreshToken);

            // Update Authorization header for retry
            originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;

            // Process all queued requests
            serverRefreshTokenQueue.processQueue();

            // Retry the original request with new token
            return instance(originalRequest);
          } else {
            throw new Error(
              refreshData.error?.message || "Token refresh failed"
            );
          }
        } catch (refreshError: any) {
          // Refresh failed - clear queue
          serverRefreshTokenQueue.processQueue(refreshError as AxiosError);
          serverRefreshTokenQueue.setIsRefreshing(false);

          // Clear auth cookies
          try {
            const cookieStore = await cookies();
            cookieStore.delete("accessToken");
            cookieStore.delete("refresh_token");
          } catch (cookieError) {
            console.error("[Server API] Error clearing cookies:", cookieError);
          }

          // Throw error to be handled by the calling server action
          return Promise.reject(refreshError);
        } finally {
          serverRefreshTokenQueue.setIsRefreshing(false);
        }
      }

      // For non-401 errors or already-retried requests, reject normally
      return Promise.reject(error);
    }
  );

  return instance;
}

// Create the server Axios instance
const serverAxiosInstance = createServerAxiosInstance();

/**
 * Server-side API client class
 * Wraps Axios with proper error handling and response formatting
 */
class ServerApiClient {
  private async request<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<{ data?: T; error?: { message?: string; code?: string } }> {
    try {
      const response = await serverAxiosInstance.request({
        url: path,
        ...config,
      });

      // Handle response structure
      if (response.data?.error) {
        return {
          error: {
            message: response.data.error.message || "Request failed",
            code: response.data.error.code,
          },
        };
      }

      return { data: response.data?.data || response.data };
    } catch (error: any) {
      if (error.response?.data?.error) {
        return {
          error: {
            message: error.response.data.error.message || "Request failed",
            code: error.response.data.error.code,
          },
        };
      }

      return {
        error: {
          message: error.message || "Network error",
        },
      };
    }
  }

  async get<T>(path: string, config?: AxiosRequestConfig) {
    return this.request<T>(path, { ...config, method: "GET" });
  }

  async post<T>(path: string, body?: any, config?: AxiosRequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: "POST",
      data: body,
    });
  }

  async put<T>(path: string, body?: any, config?: AxiosRequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: "PUT",
      data: body,
    });
  }

  async patch<T>(path: string, body?: any, config?: AxiosRequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: "PATCH",
      data: body,
    });
  }

  async delete<T>(path: string, config?: AxiosRequestConfig) {
    return this.request<T>(path, { ...config, method: "DELETE" });
  }
}

// Export singleton instance
export const serverApi = new ServerApiClient();

// Export the Axios instance for direct use if needed
export { serverAxiosInstance };

export default serverApi;
