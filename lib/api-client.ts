/**
 * Client-side API client with Axios
 * Implements silent token refresh using interceptors
 * All requests go through Next.js API proxy routes which handle authentication via HttpOnly cookies
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = "/api/proxy";

interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

interface RefreshTokenResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  error?: {
    message?: string;
    code?: string;
  };
}

/**
 * Process queue to handle multiple simultaneous 401 errors
 * Prevents multiple refresh token requests when multiple API calls fail at once
 */
class RefreshTokenQueue {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  /**
   * Add a failed request to the queue
   */
  addToQueue(resolve: (value?: any) => void, reject: (error?: any) => void) {
    this.failedQueue.push({ resolve, reject });
  }

  /**
   * Process all queued requests after successful token refresh
   */
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

  /**
   * Check if a refresh is currently in progress
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set the refreshing state
   */
  setIsRefreshing(value: boolean) {
    this.isRefreshing = value;
  }
}

const refreshTokenQueue = new RefreshTokenQueue();

/**
 * Create Axios instance with interceptors
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Important: Ensures cookies (including HttpOnly) are sent
  });

  /**
   * Request Interceptor
   * Attach any additional headers if needed
   * Note: HttpOnly cookies are automatically sent, so we don't need to manually attach tokens
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Cookies are automatically sent with withCredentials: true
      // No need to manually attach Authorization header for HttpOnly cookies
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
      // Successful response - return as is
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
        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;

        // If refresh is already in progress, queue this request
        if (refreshTokenQueue.getIsRefreshing()) {
          return new Promise((resolve, reject) => {
            refreshTokenQueue.addToQueue(() => {
              // Retry the original request after token refresh
              resolve(instance(originalRequest));
            }, reject);
          });
        }

        // Start the refresh process
        refreshTokenQueue.setIsRefreshing(true);

        try {
          // Call refresh endpoint
          // The refreshToken cookie will be sent automatically via withCredentials
          const refreshResponse = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );

          // Check if refresh was successful
          // The token might be in the response body OR set as HttpOnly cookie
          // If status is 200/201, consider it successful (cookies are set server-side)
          const isSuccess =
            (refreshResponse.status === 200 ||
              refreshResponse.status === 201) &&
            !refreshResponse.data?.error;

          if (isSuccess) {
            // Token refresh successful
            // Note: Since we're using HttpOnly cookies, the new accessToken
            // is automatically set by the server in the response cookie.
            // We don't need to manually update it in the client.

            // Process all queued requests
            refreshTokenQueue.processQueue();

            // Retry the original request
            // The new accessToken cookie will be sent automatically
            return instance(originalRequest);
          } else {
            // Refresh endpoint returned an error
            const errorMessage =
              refreshResponse.data?.error?.message || "Token refresh failed";
            throw new Error(errorMessage);
          }
        } catch (refreshError) {
          // Refresh failed - clear queue and redirect to login
          refreshTokenQueue.processQueue(refreshError as AxiosError);
          refreshTokenQueue.setIsRefreshing(false);

          // Redirect to login page
          // Use window.location for a hard redirect to ensure clean state
          // This ensures cookies are cleared and auth state is reset
          if (typeof window !== "undefined") {
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }

          return Promise.reject(refreshError);
        } finally {
          refreshTokenQueue.setIsRefreshing(false);
        }
      }

      // For non-401 errors or already-retried requests, reject normally
      return Promise.reject(error);
    }
  );

  return instance;
}

// Create the Axios instance
const axiosInstance = createAxiosInstance();

/**
 * Convert Axios response to our ApiResponse format
 */
function handleResponse<T>(response: any): ApiResponse<T> {
  if (response.data?.error) {
    return {
      error: {
        message: response.data.error.message || "Request failed",
        code: response.data.error.code,
      },
    };
  }

  // Return the entire backend response structure (includes data and meta)
  return { data: response.data };
}

/**
 * Handle errors and convert to ApiResponse format
 */
function handleError(error: any): ApiResponse {
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

class ApiClient {
  private async request<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.request({
        url: path,
        ...config,
      });

      return handleResponse<T>(response);
    } catch (error: any) {
      // If error was a 401 that triggered redirect, return error response
      if (error.response?.status === 401) {
        return handleError(error);
      }
      return handleError(error);
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

// Auth API methods (using server actions for login/register, proxy for others)
export const clientApi = {
  // Note: Login and Register use Server Actions, not this client
  // This client is for authenticated API calls after login

  requestOtp: async (email: string) => {
    const client = new ApiClient();
    return client.post("auth/otp/request", { email });
  },

  verifyOtp: async (email: string, code: string) => {
    const client = new ApiClient();
    return client.post("auth/otp/verify", { email, code });
  },

  forgotPassword: async (email: string) => {
    const client = new ApiClient();
    return client.post("auth/forgot-password", { email });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const client = new ApiClient();
    return client.post("auth/reset-password", { email, otp, newPassword });
  },

  googleLogin: async (code: string) => {
    const client = new ApiClient();
    return client.post("auth/google-login", { code });
  },

  refreshToken: async () => {
    const client = new ApiClient();
    return client.post("auth/refresh");
  },

  // Product API methods
  getProducts: async (params?: {
    keyword?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
  }) => {
    const client = new ApiClient();
    const queryParams = new URLSearchParams();
    if (params?.keyword) queryParams.append("keyword", params.keyword);
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.size) queryParams.append("size", params.size.toString());

    const query = queryParams.toString();
    return client.get(`products${query ? `?${query}` : ""}`);
  },

  getProductById: async (id: string) => {
    const client = new ApiClient();
    return client.get(`products/${id}`);
  },

  getProductBySlug: async (slug: string) => {
    const client = new ApiClient();
    return client.get(`products/slug/${slug}`);
  },

  createProduct: async (product: any) => {
    const client = new ApiClient();
    return client.post("products", product);
  },

  createDraftProduct: async (product: any) => {
    const client = new ApiClient();
    return client.post("products/draft", product);
  },

  updateProduct: async (id: string, product: any) => {
    const client = new ApiClient();
    return client.put(`products/${id}`, product);
  },

  updateProductInfo: async (id: string, product: any) => {
    const client = new ApiClient();
    return client.patch(`products/${id}`, product);
  },

  deleteProduct: async (id: string) => {
    const client = new ApiClient();
    return client.delete(`products/${id}`);
  },

  // Category API methods
  getCategories: async () => {
    const client = new ApiClient();
    return client.get("categories");
  },

  // Variant API methods
  createVariant: async (productId: string, variant: any) => {
    const client = new ApiClient();
    return client.post(`products/${productId}/variants`, variant);
  },

  updateVariant: async (variantId: string, variant: any) => {
    const client = new ApiClient();
    return client.put(`products/variants/${variantId}`, variant);
  },

  updateVariantInfo: async (variantId: string, variant: any) => {
    const client = new ApiClient();
    return client.put(`products/variants/${variantId}/info`, variant);
  },

  updateVariantStatus: async (variantId: string, variant: any) => {
    const client = new ApiClient();
    return client.put(`products/variants/${variantId}/status`, variant);
  },

  deleteVariant: async (variantId: string) => {
    const client = new ApiClient();
    return client.delete(`products/variants/${variantId}`);
  },
};

// Export the Axios instance for direct use if needed
export { axiosInstance };

export default new ApiClient();
