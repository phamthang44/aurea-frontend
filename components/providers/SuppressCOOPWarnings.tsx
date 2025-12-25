"use client";

import { useEffect } from "react";

/**
 * Suppresses Cross-Origin-Opener-Policy console warnings
 * These warnings occur when Google OAuth popup tries to check window.closed
 * They are harmless but annoying in the console
 */
export function SuppressCOOPWarnings() {
  useEffect(() => {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;

    // Helper to check if message is COOP-related
    const isCOOPWarning = (message: string): boolean => {
      return (
        message.includes("Cross-Origin-Opener-Policy") ||
        message.includes("Cross-Origin-Opener-Policy policy") ||
        message.includes("window.closed") ||
        message.includes("COOP") ||
        message.includes("would block the window.closed call")
      );
    };

    // Override console.warn to filter out COOP warnings
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter out COOP-related warnings
      if (isCOOPWarning(message)) {
        // Silently ignore these warnings
        return;
      }

      // Call original warn for other messages
      originalWarn.apply(console, args);
    };

    // Override console.error to filter out COOP errors
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter out COOP-related errors
      if (isCOOPWarning(message)) {
        // Silently ignore these errors
        return;
      }

      // Call original error for other messages
      originalError.apply(console, args);
    };

    // Cleanup: restore original console methods on unmount
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}

