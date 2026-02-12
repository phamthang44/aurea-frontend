import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email?: string;
    fullName?: string;
    roles?: string[]; // Keep for backward compat
    permissions?: string[]; // NEW: Permission-based authorization
    avatarUrl?: string;
    phoneNumber?: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (
      state,
      action: PayloadAction<{
        user?: {
          email?: string;
          fullName?: string;
          roles?: string[];
          permissions?: string[];
          avatarUrl?: string;
          phoneNumber?: string;
        };
      }>,
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user || null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setUser: (
      state,
      action: PayloadAction<{
        email?: string;
        fullName?: string;
        roles?: string[];
        permissions?: string[];
        avatarUrl?: string;
        phoneNumber?: string;
      }>,
    ) => {
      state.user = action.payload;
    },
  },
});

export const { setAuthenticated, clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
