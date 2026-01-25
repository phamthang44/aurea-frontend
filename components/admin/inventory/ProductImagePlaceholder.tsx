"use client";

import { Package } from "lucide-react";

interface ProductImagePlaceholderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Placeholder component for missing/broken product images in admin panel
 * Uses a clean, professional design suitable for inventory management
 */
export function ProductImagePlaceholder({
  size = "md",
  className = "",
}: ProductImagePlaceholderProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 ${className}`}
    >
      {/* Decorative corner accents for larger sizes */}
      {size === "lg" && (
        <>
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-slate-300 dark:border-slate-600" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-slate-300 dark:border-slate-600" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-slate-300 dark:border-slate-600" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-slate-300 dark:border-slate-600" />
        </>
      )}

      <Package className={`${iconSizes[size]} text-slate-400 dark:text-slate-500`} />
      
      {size === "lg" && (
        <p className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2 font-medium">
          No Image
        </p>
      )}
    </div>
  );
}
