"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser, setAuthenticated } from "@/lib/store/authSlice";
import {
  fetchUserProfileAction,
  checkAuthAction,
  getRolesFromRefreshAction,
} from "@/app/actions/auth";

/**
 * Hook to initialize auth state on app load
 * Fetches user profile if token exists but user data is missing
 * Returns loading state to prevent premature redirects
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        setIsInitializing(true);

        // Check if we have a token
        const authCheck = await checkAuthAction();

        if (authCheck.isAuthenticated) {
          // If authenticated but no user data, fetch it
          if (!user) {
            // console.log("[Auth Init] Token exists but user data is missing. Fetching user profile...");

            // Fetch user profile (doesn't include roles)
            const profileResult = await fetchUserProfileAction();

            // Fetch roles from Auth Module via refresh endpoint
            // Roles come from AuthResponse, not from UserProfileResponse
            const rolesResult = await getRolesFromRefreshAction();
            // console.log("[Auth Init] Roles from Auth Module:", rolesResult.roles);
            // Handle profile fetch result - even if it fails, we may have partial data
            if (profileResult.success && profileResult.data) {
              // console.log("[Auth Init] User profile fetched successfully:", profileResult.data);
              // console.log("[Auth Init] Roles from Auth Module:", rolesResult.roles);

              // Merge profile data with roles from Auth Module
              const userData = {
                ...profileResult.data,
                roles: rolesResult.success ? rolesResult.roles : [],
              };

              // Set user data in Redux with roles from Auth Module
              dispatch(setAuthenticated({ user: userData }));
            } else {
              // Profile fetch failed - this could be because profile doesn't exist yet
              console.warn(
                "[Auth Init] Failed to fetch user profile:",
                profileResult.error
              );

              // If we have partial data (e.g., from a graceful error handling), use it
              if (profileResult.data) {
                const userData = {
                  ...profileResult.data,
                  roles: rolesResult.success ? rolesResult.roles : [],
                };
                dispatch(setAuthenticated({ user: userData }));
                console.log(
                  "[Auth Init] Using partial user data (profile may be created later)"
                );
              } else {
                // If no data at all, still try to set roles if we have them
                if (rolesResult.success && rolesResult.roles.length > 0) {
                  dispatch(
                    setAuthenticated({
                      user: {
                        roles: rolesResult.roles,
                      },
                    })
                  );
                  console.log(
                    "[Auth Init] Set user with roles only (profile will be created later)"
                  );
                }
              }
              // Don't clear auth state - let the user continue, profile will be created automatically
            }
          } else {
            // console.log("[Auth Init] User data already exists:", user);
          }
        } else {
          console.log("[Auth Init] No token found. User is not authenticated.");
        }
      } finally {
        // Always mark initialization as complete
        setIsInitializing(false);
      }
    }

    // Only run on mount or when user becomes null (after logout)
    initializeAuth();
  }, []); // Empty deps - only run once on mount

  return { isAuthenticated, user, isInitializing };
}


