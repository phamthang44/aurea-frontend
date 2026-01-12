"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CartItemResponse } from "@/lib/api/cart";

/**
 * Format currency to VND with luxury styling
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

interface CartItemProps {
  item: CartItemResponse;
  loading: boolean;
  onUpdateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
  onRemoveItem: (itemId: number, itemName: string) => Promise<void>;
}

export function CartItem({
  item,
  loading,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemProps) {
  const { t } = useTranslation();
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Check if item is out of stock using backend data
  const isOutOfStock =
    item.availableStock === 0 || item.availableStock === undefined;
  const hasInsufficientStock =
    item.availableStock !== undefined &&
    item.availableStock > 0 &&
    item.availableStock < item.quantity;

  const handleImageError = () => {
    setImageErrors((prev) => new Set(prev).add(item.id));
  };

  return (
    <div
      className={`flex gap-4 p-4 bg-card border-1 rounded-lg transition-all duration-300 ${
        isOutOfStock || hasInsufficientStock
          ? "border-destructive/30 hover:border-destructive/50 opacity-75"
          : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
      }`}
    >
      {/* Product Image */}
      <div className="relative w-24 h-32 flex-shrink-0 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525] rounded-lg overflow-hidden border border-[#D4AF37]/20">
        {item.thumbnail && !imageErrors.has(item.id) ? (
          <>
            <Image
              src={item.thumbnail}
              alt={item.productName || "Product"}
              fill
              className="object-cover"
              sizes="96px"
              onError={handleImageError}
            />
            {/* Sold Out / Insufficient Stock Overlay - Must be above image with higher z-index */}
            {(isOutOfStock || hasInsufficientStock) && (
              <div className="absolute inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-20 pointer-events-none">
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-destructive text-white rounded-md shadow-lg">
                  {isOutOfStock
                    ? t("cart.soldOut")
                    : t("cart.insufficientStock", {
                        defaultValue: "Insufficient Stock",
                      })}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525]">
            <ShoppingBag className="h-8 w-8 text-[#D4AF37]/30 mb-2" />
            <p className="text-[10px] font-light dark:text-[#D4AF37]/50 tracking-wider text-center px-1">
              {t("cart.noImage", { defaultValue: "No Image" })}
            </p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-normal mb-2">
            {item.productName || "Unknown Product"}
            {item.sku && (
              <span className="text-xs text-muted-foreground ml-2 font-normal">
                ({item.sku})
              </span>
            )}
          </h3>
          <p className="text-base font-semibold text-[#D4AF37]">
            {formatVND(item.price || 0)}
          </p>
          {/* Stock Status Warning */}
          {isOutOfStock && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1 font-medium">
              <span>⚠️</span>
              <span>{t("cart.soldOut")}</span>
            </p>
          )}
          {hasInsufficientStock && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1 font-medium">
              <span>⚠️</span>
              <span>
                {t("cart.insufficientStockMessage", {
                  available: item.availableStock,
                  requested: item.quantity,
                  defaultValue: `Only ${item.availableStock} available (requested ${item.quantity})`,
                })}
              </span>
            </p>
          )}
          {!isOutOfStock &&
            !hasInsufficientStock &&
            item.availableStock !== undefined &&
            item.availableStock < 10 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {t("cart.lowStock", { stock: item.availableStock })}
              </p>
            )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 border-2 border-[#D4AF37]/30 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || loading}
              className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={
                isOutOfStock ||
                hasInsufficientStock ||
                (item.availableStock !== undefined &&
                  item.quantity >= item.availableStock) ||
                loading
              }
              className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10 disabled:opacity-50"
              title={
                isOutOfStock
                  ? t("cart.soldOut", { defaultValue: "Sold Out" })
                  : hasInsufficientStock
                  ? t("cart.insufficientStock", {
                      defaultValue: "Insufficient Stock",
                    })
                  : item.availableStock !== undefined &&
                    item.quantity >= item.availableStock
                  ? t("cart.maxStockReached", {
                      defaultValue: "Maximum stock reached",
                    })
                  : undefined
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id, item.productName || "Item")}
            disabled={loading}
            className="text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("common.remove")}
          </Button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p
          className={`text-lg font-semibold ${
            isOutOfStock || hasInsufficientStock
              ? "text-muted-foreground line-through"
              : "text-[#D4AF37]"
          }`}
        >
          {formatVND(item.subtotalPrice ?? (item.price || 0) * item.quantity)}
        </p>
      </div>
    </div>
  );
}

