"use server";

import { cookies } from "next/headers";
import type {
  ApiResultAuthResponse,
  ApiResultVoid,
  AuthResponse,
  AuthStatus,
} from "@/lib/types/auth";
import { serverApi } from "@/lib/server-api";

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
 * Server Action: Get roles from Auth Module via refresh token endpoint
 * This is used to get roles on page refresh since UserProfileResponse doesn't contain roles
 * Roles come from AuthResponse in the refresh endpoint
 * 
 * Uses serverApi which handles token refresh properly and ensures cookies are managed correctly
 */
export async function getRolesFromRefreshAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return {
        success: false,
        error: "No refresh token found",
        roles: [],
      };
    }

    // Use serverApi to call refresh endpoint
    // serverApi handles the refresh token correctly and will automatically retry on 401
    // The backend expects refresh_token cookie, serverApi sets it correctly
    const result = await serverApi.post<AuthResponse>("/api/v1/auth/refresh", {}, { withCredentials: true });
    
    console.log("[Server Action] Get Roles From Refresh - Response data:", JSON.stringify(result, null, 2));

    if (result.error) {
      return {
        success: false,
        error: result.error.message || "Failed to get roles from refresh",
        roles: [],
      };
    }

    const authData = result?.data;
    if (!authData) {
      return {
        success: false,
        error: "Invalid response from refresh endpoint",
        roles: [],
      };
    }

    // Update access token if new one is provided
    // serverApi already updates cookies in its interceptor, but we ensure it here too
    if (authData.accessToken) {
      await setAuthCookies(authData.accessToken, authData.refreshToken);
    }

    // Return roles from AuthResponse
    // Note: This also refreshes the access token, which is beneficial for keeping tokens fresh
    return {
      success: true,
      roles: authData.roles || [],
    };
  } catch (error: any) {
    console.error("[Server Action] Get Roles From Refresh - Error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while getting roles",
      roles: [],
    };
  }
}

/**
 * Server Action: Fetch current user profile from backend
 * 
 * Note: This endpoint (/api/v1/users/me) uses Auth Module authentication via JWT token.
 * The UserController uses @AuthenticationPrincipal SecurityUserDetails which extracts
 * user data from the Auth Module's JWT token, making this effectively part of the Auth Module flow.
 * 
 * Uses serverApi which automatically handles token refresh on 401 errors.
 * This is the single source of truth for user data after authentication.
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

    // Use serverApi which automatically handles token refresh on 401 errors
    // The interceptor will refresh the token and retry if needed
    // Note: userId is string (TSID/Long) to prevent precision loss in JavaScript
    const result = await serverApi.get<{
      email?: string;
      fullName?: string;
      avatarUrl?: string;
      userId?: string; // TSID type (Long in Java) - must be string in TypeScript to prevent precision loss
    }>("/api/v1/users/me", {
      withCredentials: true,
    });

    // Handle error cases
    if (result.error) {
      const errorMessage = result.error.message || "";
      
      // Check if error is "User not found" or "USER PROFILE not found"
      // This happens when a user exists in auth but doesn't have a user profile yet
      // (e.g., after Google OAuth login before profile is created)
      if (errorMessage.includes("not found") || errorMessage.includes("USER_001") || errorMessage.includes("USER PROFILE")) {
        console.warn("[Server Action] User profile not found. User may need to complete profile setup.");
        
        // Try to create user profile using the createUserProfile endpoint
        // Note: This endpoint requires ADMIN role, so it may not work for regular users
        // But we try it as a fallback - if it fails, we handle gracefully
        try {
          const createResult = await serverApi.post<{
            email?: string;
            fullName?: string;
            avatarUrl?: string;
            userId?: string;
          }>("/api/v1/users/profiles", {});
          
          if (createResult.data && !createResult.error) {
            console.log("[Server Action] User profile created successfully via createUserProfile endpoint");
            // Return the newly created profile
            const userProfile = createResult.data;
            return {
              success: true,
              data: {
                email: userProfile?.email,
                fullName: userProfile?.fullName || "New User",
                avatarUrl: userProfile?.avatarUrl,
                userId: userProfile?.userId,
              },
            };
          }
        } catch (createError: any) {
          console.warn("[Server Action] Could not create user profile automatically:", createError);
          // If creation fails (e.g., not admin or endpoint not available),
          // return a graceful error that allows the app to continue
          // The user can still use the app, they just won't have profile data
          return {
            success: false,
            error: "User profile not yet created. Profile will be created automatically or you can complete it later.",
            // Return partial data so the app can continue
            data: {
              email: undefined,
              fullName: undefined,
              avatarUrl: undefined,
              userId: undefined,
            },
          };
        }
      }
      
      // For other errors, return as-is
      return {
        success: false,
        error: result.error.message || "Failed to fetch user profile",
      };
    }

    // UserProfileResponse structure from UserController
    // Note: UserProfileResponse does NOT contain roles
    // Roles come from Auth Module responses (login, refresh, google-login) via AuthResponse
    const userProfile = result.data;
    console.log("[Server Action] Fetch User Profile - Raw User Data from API:", JSON.stringify(userProfile, null, 2));

    // Map UserProfileResponse fields: fullName, avatarUrl, userId, email
    // Roles are NOT included here - they come from Auth Module (login/refresh/google-login responses)
    return {
      success: true,
      data: {
        email: userProfile?.email,
        fullName: userProfile?.fullName,
        avatarUrl: userProfile?.avatarUrl,
        userId: userProfile?.userId,

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
