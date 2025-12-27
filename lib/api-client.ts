/**
 * Client-side API client
 * All requests go through Next.js API proxy routes which handle authentication via cookies
 */

const API_BASE_URL = '/api/proxy';

interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.error?.message || 'Request failed',
            code: data.error?.code,
          },
        };
      }

      return { data };
    } catch (error: any) {
      return {
        error: {
          message: error.message || 'Network error',
        },
      };
    }
  }

  async get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

// Auth API methods (using server actions for login/register, proxy for others)
export const clientApi = {
  // Note: Login and Register use Server Actions, not this client
  // This client is for authenticated API calls after login

  requestOtp: async (email: string) => {
    const client = new ApiClient();
    return client.post('auth/otp/request', { email });
  },

  verifyOtp: async (email: string, code: string) => {
    const client = new ApiClient();
    return client.post('auth/otp/verify', { email, code });
  },

  forgotPassword: async (email: string) => {
    const client = new ApiClient();
    return client.post('auth/forgot-password', { email });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const client = new ApiClient();
    return client.post('auth/reset-password', { email, otp, newPassword });
  },

  googleLogin: async (code: string) => {
    const client = new ApiClient();
    return client.post('auth/google-login', { code });
  },

  refreshToken: async () => {
    const client = new ApiClient();
    return client.post('auth/refresh');
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
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    
    const query = queryParams.toString();
    return client.get(`products${query ? `?${query}` : ''}`);
  },

  getProductById: async (id: string) => {
    const client = new ApiClient();
    return client.get(`products/${id}`);
  },

  createProduct: async (product: any) => {
    const client = new ApiClient();
    return client.post('products', product);
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
};

export default new ApiClient();

