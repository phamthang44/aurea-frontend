"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="hidden sm:block h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Body */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
        <div>
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Progress Stepper Skeleton */}
      <Skeleton className="h-28 w-full rounded-2xl" />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Section */}
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
