"use client";

import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/api/my-orders";
import { useTranslation } from "react-i18next";

interface OrderStatusTabsProps {
  activeStatus: OrderStatus | "ALL";
  onStatusChange: (status: OrderStatus | "ALL") => void;
  className?: string;
}

interface TabConfig {
  value: OrderStatus | "ALL";
  labelKey: string;
  defaultLabel: string;
}

const tabs: TabConfig[] = [
  { value: "ALL", labelKey: "orders.tabs.all", defaultLabel: "All" },
  { value: "PENDING", labelKey: "orders.tabs.pending", defaultLabel: "Pending" },
  { value: "CONFIRMED", labelKey: "orders.tabs.confirmed", defaultLabel: "Confirmed" },
  { value: "SHIPPING", labelKey: "orders.tabs.shipping", defaultLabel: "Shipping" },
  { value: "COMPLETED", labelKey: "orders.tabs.completed", defaultLabel: "Completed" },
  { value: "CANCELLED", labelKey: "orders.tabs.cancelled", defaultLabel: "Cancelled" },
];

export function OrderStatusTabs({ 
  activeStatus, 
  onStatusChange, 
  className 
}: OrderStatusTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Tabs */}
      <div className="hidden md:flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
              activeStatus === tab.value
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800"
            )}
          >
            {t(tab.labelKey, { defaultValue: tab.defaultLabel })}
          </button>
        ))}
      </div>

      {/* Mobile Tabs - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 border",
                activeStatus === tab.value
                  ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:border-[#D4AF37]/50"
              )}
            >
              {t(tab.labelKey, { defaultValue: tab.defaultLabel })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
