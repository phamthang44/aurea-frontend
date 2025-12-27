"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser, setAuthenticated } from "@/lib/store/authSlice";
import { fetchUserProfileAction, checkAuthAction } from "@/app/actions/auth";

/**
 * Hook to initialize auth state on app load
 * Fetches user profile if token exists but user data is missing
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    async function initializeAuth() {
      // Check if we have a token
      const authCheck = await checkAuthAction();
      
      if (authCheck.isAuthenticated) {
        // If authenticated but no user data, fetch it
        if (!user) {
          console.log("[Auth Init] Token exists but user data is missing. Fetching user profile...");
          
          const profileResult = await fetchUserProfileAction();
          
          if (profileResult.success && profileResult.data) {
            console.log("[Auth Init] User profile fetched successfully:", profileResult.data);
            
            // Set user data in Redux
            dispatch(setAuthenticated({ user: profileResult.data }));
          } else {
            console.error("[Auth Init] Failed to fetch user profile:", profileResult.error);
            // If fetch fails, token might be invalid - but don't clear auth state automatically
            // Let the user try to use the app, and individual API calls will handle auth errors
          }
        } else {
          console.log("[Auth Init] User data already exists:", user);
        }
      } else {
        console.log("[Auth Init] No token found. User is not authenticated.");
      }
    }

    // Only run on mount or when user becomes null (after logout)
    initializeAuth();
  }, []); // Empty deps - only run once on mount

  return { isAuthenticated, user };
}

