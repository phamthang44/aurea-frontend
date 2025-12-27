"use server";

import { cookies } from "next/headers";
import type {
  ApiResultAuthResponse,
  ApiResultVoid,
  AuthStatus,
} from "@/lib/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Helper function to set auth cookies
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
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

/**
 * Server Action: Login with Password
 */
export async function loginWithPasswordAction(
  identifier: string,
  password: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data: ApiResultAuthResponse = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Login failed",
      };
    }

    const authData = data.data;
    if (!authData || !authData.accessToken) {
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    // Set auth cookies
    await setAuthCookies(authData.accessToken, authData.refreshToken);

    // Use roles from backend response (single source of truth)
    // User profile will be fetched separately via fetchUserProfileAction
    return {
      success: true,
      data: {
        status: authData.status as AuthStatus,
        roles: authData.roles || [],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred during login",
    };
  }
}

/**
 * Server Action: Login with Google
 */
export async function loginWithGoogleAction(code: string) {
  try {
    console.log("[Server Action] Google login - API URL:", `${API_BASE_URL}/api/v1/auth/google-login`);
    console.log("[Server Action] Code present:", !!code);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    console.log("[Server Action] Response status:", response.status, response.statusText);
    
    const data: ApiResultAuthResponse = await response.json();
    console.log("[Server Action] Response data:", {
      success: !data.error,
      error: data.error,
      hasAccessToken: !!data.data?.accessToken,
    });

    if (!response.ok || data.error) {
      console.error("[Server Action] Google login failed:", data.error);
      return {
        success: false,
        error: data.error?.message || `Google login failed (${response.status})`,
      };
    }

    const authData = data.data;
    if (!authData || !authData.accessToken) {
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    // Set auth cookies
    await setAuthCookies(authData.accessToken, authData.refreshToken);

    // Use roles from backend response (single source of truth)
    // User profile will be fetched separately via fetchUserProfileAction
    return {
      success: true,
      data: {
        status: authData.status as AuthStatus,
        roles: authData.roles || [],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred during Google login",
    };
  }
}

/**
 * Server Action: Finish Registration
 * Called after OTP verification when status is REQUIRE_REGISTRATION
 */
export async function finishRegistrationAction(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const cookieStore = await cookies();
    const registerToken = cookieStore.get("registerToken")?.value;

    if (!registerToken) {
      return {
        success: false,
        error: "Registration token not found. Please start over.",
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName, registerToken }),
    });

    const data: ApiResultAuthResponse = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Registration failed",
      };
    }

    const authData = data.data;
    if (!authData || !authData.accessToken) {
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    // Set auth cookies after successful registration
    await setAuthCookies(authData.accessToken, authData.refreshToken);

    // Clear registerToken cookie
    cookieStore.delete("registerToken");

    // Use roles from backend response (single source of truth)
    // User profile will be fetched separately via fetchUserProfileAction
    return {
      success: true,
      data: {
        status: authData.status as AuthStatus,
        roles: authData.roles || [],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred during registration",
    };
  }
}

/**
 * Server Action: Logout
 */
export async function logoutAction() {
  const cookieStore = await cookies();

  // Call backend logout endpoint
  try {
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    // Continue with cookie deletion even if backend call fails
    console.error("Logout API call failed:", error);
  }

  // Clear cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("registerToken");
}

/**
 * Server Action: Request OTP
 */
export async function requestOtpAction(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/otp/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data: ApiResultVoid = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Failed to send OTP",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

/**
 * Server Action: Verify OTP
 * Returns status to determine next step:
 * - LOGIN_SUCCESS: User exists, tokens set in cookies
 * - REQUIRE_REGISTRATION: New user, returns registerToken
 */
export async function verifyOtpAction(email: string, code: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data: ApiResultAuthResponse = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "OTP verification failed",
      };
    }

    const authData = data.data;
    if (!authData) {
      return {
        success: false,
        error: "Invalid response from server",
      };
    }

    // Case A: LOGIN_SUCCESS - User exists, set cookies and return
    if (authData.status === "LOGIN_SUCCESS" && authData.accessToken) {
      await setAuthCookies(authData.accessToken, authData.refreshToken);
      
      // Use roles from backend response (single source of truth)
      // User profile will be fetched separately via fetchUserProfileAction
      return {
        success: true,
        data: {
          status: authData.status as AuthStatus,
          requiresRegistration: false,
          roles: authData.roles || [],
        },
      };
    }

    // Case B: REQUIRE_REGISTRATION - New user, save registerToken in cookie
    if (authData.status === "REQUIRE_REGISTRATION" && authData.registerToken) {
      const cookieStore = await cookies();
      cookieStore.set("registerToken", authData.registerToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });

      return {
        success: true,
        data: {
          status: authData.status as AuthStatus,
          requiresRegistration: true,
          registerToken: authData.registerToken,
        },
      };
    }

    return {
      success: false,
      error: "Unexpected response status",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

/**
 * Server Action: Forgot Password - Request OTP
 */
export async function forgotPasswordAction(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data: ApiResultVoid = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Failed to send password reset OTP",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

/**
 * Server Action: Reset Password
 */
export async function resetPasswordAction(
  email: string,
  otp: string,
  newPassword: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data: ApiResultVoid = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Failed to reset password",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

/**
 * Server Action: Check authentication status
 */
export async function checkAuthAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  return {
    isAuthenticated: !!accessToken,
  };
}

/**
 * Server Action: Fetch current user profile from backend
 * This is the single source of truth for user data
 */
export async function fetchUserProfileAction() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        error: "No access token found",
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log("[Server Action] Fetch User Profile - Raw API Response:", JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || "Failed to fetch user profile",
      };
    }

    const userProfile = data.data;
    console.log("[Server Action] Fetch User Profile - Raw User Data from API:", JSON.stringify(userProfile, null, 2));
    console.log("[Server Action] Fetch User Profile - Checking role fields:");
    console.log("  - userProfile.role:", userProfile?.role);
    console.log("  - userProfile.roles:", userProfile?.roles);
    console.log("  - userProfile.authorities:", userProfile?.authorities);

    // Extract roles - check all possible field names
    let roles: string[] = [];
    if (userProfile?.roles && Array.isArray(userProfile.roles)) {
      roles = userProfile.roles;
    } else if (userProfile?.authorities && Array.isArray(userProfile.authorities)) {
      roles = userProfile.authorities;
    } else if (userProfile?.role) {
      // Handle single role string
      roles = [userProfile.role];
    }

    return {
      success: true,
      data: {
        email: userProfile?.email,
        fullName: userProfile?.fullName,
        avatarUrl: userProfile?.avatarUrl,
        userId: userProfile?.userId,
        roles: roles,
      },
    };
  } catch (error: any) {
    console.error("[Server Action] Fetch User Profile - Error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while fetching user profile",
    };
  }
}
