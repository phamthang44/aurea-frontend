import Image from "next/image";
import { CartItemResponse } from "@/lib/api/cart";
import { useState } from "react";

interface OrderSummaryItemProps {
  item: CartItemResponse;
  formatVND: (amount: number) => string;
  noImageLabel: string;
}

export function OrderSummaryItem({
  item,
  formatVND,
  noImageLabel,
}: OrderSummaryItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-4 pb-4 border-b border-gray-200 dark:border-white/10 last:border-0">
      <div className="relative w-20 h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 border border-gray-300 dark:border-white/20 overflow-hidden rounded">
        {item.thumbnail && !imageError ? (
          <Image
            src={item.thumbnail}
            alt={item.productName || noImageLabel}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-xs text-gray-500 dark:text-zinc-500 font-medium text-center px-2"
              style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
            >
              {noImageLabel}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="text-sm font-medium mb-1 truncate text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {item.productName || noImageLabel}
        </h3>
        {item.sku && (
          <p
            className="text-xs text-gray-600 dark:text-zinc-400 mb-2"
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          >
            SKU: {item.sku}
          </p>
        )}
        <p
          className="text-sm text-[#d4b483] font-medium"
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        >
          {formatVND(item.price || 0)} × {item.quantity}
        </p>
      </div>
    </div>
  );
}
