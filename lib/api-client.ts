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
};

export default new ApiClient();

