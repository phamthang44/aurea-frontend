"use client";

import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/api/my-orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50",
  },
  SHIPPING: {
    label: "Shipping",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700/50",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
  },
  RETURNED: {
    label: "Returned",
    className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600/50",
  },
};

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function OrderStatusBadge({ 
  status, 
  className,
  size = "md" 
}: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border whitespace-nowrap tracking-wide uppercase",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
