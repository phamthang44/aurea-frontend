"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import { OrderSummary } from "@/lib/api/my-orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useTranslation } from "react-i18next";

interface OrderCardProps {
  order: OrderSummary;
  index?: number;
}

/**
 * Format currency to VND
 */
function formatVND(amount: number): string {
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/,/g, ".") + "đ"
  );
}

/**
 * Format date to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderCard({ order, index = 0 }: OrderCardProps) {
  const { t } = useTranslation();
  const otherItemsCount = order.totalItems - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/account/orders/${order.code}`} className="block no-underline">
        <div className="group bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 hover:border-[#D4AF37]/50 dark:hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all duration-300 cursor-pointer">
          {/* Header: Order Code + Date + Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold text-gray-900 dark:text-white tracking-wide">
                  {order.code}
                </span>
              </div>
              <span className="hidden sm:inline text-gray-300 dark:text-zinc-600">•</span>
              <span className="hidden sm:inline text-sm text-gray-500 dark:text-zinc-400">
                {formatDate(order.createdAt)}
              </span>
            </div>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>

          {/* Mobile date */}
          <p className="sm:hidden text-sm text-gray-500 dark:text-zinc-400 mb-4">
            {formatDate(order.createdAt)}
          </p>

          {/* Body: Thumbnail + Product info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 border border-gray-200 dark:border-zinc-700">
              {order.firstProductThumbnail ? (
                <Image
                  src={order.firstProductThumbnail}
                  alt={order.firstProductName || "Product"}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {order.firstProductName || t("orders.unknownProduct", { defaultValue: "Product" })}
              </p>
              {otherItemsCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  {t("orders.andOtherItems", { 
                    count: otherItemsCount, 
                    defaultValue: `and ${otherItemsCount} other ${otherItemsCount === 1 ? 'item' : 'items'}` 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Footer: Total + View Detail */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                {t("orders.total", { defaultValue: "Total" })}
              </p>
              <p className="text-lg font-bold text-[#D4AF37]">
                {formatVND(order.finalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-zinc-400 group-hover:text-[#D4AF37] transition-colors">
              <span>{t("orders.viewDetail", { defaultValue: "View Detail" })}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
