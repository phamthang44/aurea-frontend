"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

import { OrderItem } from "@/lib/api/my-orders";
import { slugify } from "@/lib/utils";
import { formatVND } from "@/lib/utils/order-formatters";

interface OrderItemCardProps {
  item: OrderItem;
  /** Show variant details (size, color) */
  showVariant?: boolean;
  /** Show quantity × unit price breakdown */
  showBreakdown?: boolean;
}

/**
 * Build product URL with embedded ID format: {slug}-i.{id}
 */
function buildProductUrl(item: OrderItem): string {
  const slug = item.productSlug || slugify(item.productName);
  return `/product/${slug}-i.${item.productId}`;
}

/**
 * Reusable component for displaying an order item
 */
export function OrderItemCard({
  item,
  showVariant = true,
  showBreakdown = true,
}: OrderItemCardProps) {
  return (
    <div className="flex gap-5 py-5 first:pt-0 last:pb-0">
      {/* Product Image */}
      <div className="relative w-20 h-24 flex-shrink-0 bg-muted/20 border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-muted-foreground/30 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Link
          href={buildProductUrl(item)}
          className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-300 no-underline line-clamp-2 tracking-wide"
        >
          {item.productName}
        </Link>
        <div className="text-xs text-muted-foreground/60 space-y-0.5 tracking-wide">
          {showVariant &&
            (item.variantAttributes?.size || item.variantAttributes?.color) && (
              <p>
                {item.variantAttributes.size && (
                  <span>Size: {item.variantAttributes.size}</span>
                )}
                {item.variantAttributes.size &&
                  item.variantAttributes.color &&
                  " · "}
                {item.variantAttributes.color && (
                  <span>Color: {item.variantAttributes.color}</span>
                )}
              </p>
            )}
          {showBreakdown && (
            <p>
              {item.quantity} × {formatVND(item.sellingPrice)}
            </p>
          )}
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="text-sm font-medium text-foreground tracking-wide">
          {formatVND(item.subtotal)}
        </p>
      </div>
    </div>
  );
}
