"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setAuthenticated } from "@/lib/store/authSlice";
import { checkAuthAction } from "@/app/actions/auth";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check auth status from server (cookies)
    checkAuthAction().then((result) => {
      if (result.isAuthenticated) {
        dispatch(setAuthenticated({}));
      }
    });
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
