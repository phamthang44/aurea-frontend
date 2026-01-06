"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
      .replace(/,/g, ".") + "₫"
  );
}

interface CartOrderSummaryProps {
  items: CartItemResponse[];
  subTotal: number;
  shippingFee: number;
  discount: number;
  finalTotalPrice: number;
  promotionNote?: string;
  loading: boolean;
  isAuthenticated: boolean;
  onCheckout: () => void;
}

export function CartOrderSummary({
  items,
  subTotal,
  shippingFee,
  discount,
  finalTotalPrice,
  promotionNote,
  loading,
  isAuthenticated,
  onCheckout,
}: CartOrderSummaryProps) {
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = useState("");
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.error(t("cart.invalidCoupon"), {
        description: t("cart.couponExpired"),
      });
    }
  };

  const hasOutOfStockItems = items.some((item) => {
    const outOfStock = item.availableStock === 0 || item.availableStock === undefined;
    const insufficient =
      item.availableStock !== undefined &&
      item.availableStock > 0 &&
      item.availableStock < item.quantity;
    return outOfStock || insufficient;
  });

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <div className="bg-card border-2 border-[#D4AF37]/30 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-light tracking-wider">
            {t("cart.orderSummary")}
          </h2>

          <Separator className="bg-[#D4AF37]/20" />

          {/* Coupon Code */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              {t("cart.couponCode")}
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t("cart.enterCode")}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="border-[#D4AF37]/30"
              />
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                {t("common.apply")}
              </Button>
            </div>
          </div>

          <Separator className="bg-[#D4AF37]/20" />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span className="font-medium">{formatVND(subTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">
                  {t("cart.discount", { defaultValue: "Discount" })}
                </span>
                <span className="font-medium text-green-600">
                  -{formatVND(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">{t("cart.shipping")}</span>
              <span className="font-medium">
                {shippingFee === 0 ? (
                  <span className="text-green-600">{t("cart.free")}</span>
                ) : (
                  formatVND(shippingFee)
                )}
              </span>
            </div>
            {/* Promotion Note - Show if available (after mount to avoid hydration issues) */}
            {mounted && promotionNote && promotionNote.trim().length > 0 && (
              <p
                className="text-xs text-muted-foreground italic"
                suppressHydrationWarning
              >
                {promotionNote.trim()}
              </p>
            )}
          </div>

          <Separator className="bg-[#D4AF37]/20" />

          {/* Total */}
          <div className="flex justify-between text-lg">
            <span className="font-medium">{t("cart.total")}</span>
            <span className="font-bold text-[#D4AF37]">
              {formatVND(finalTotalPrice)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-base font-medium tracking-wide disabled:opacity-50"
            disabled={loading || hasOutOfStockItems}
            onClick={onCheckout}
            title={
              hasOutOfStockItems
                ? t("cart.removeOutOfStockItems", {
                    defaultValue: "Please remove out of stock items before checkout",
                  })
                : undefined
            }
          >
            {loading
              ? t("cart.loading", { defaultValue: "Loading..." })
              : t("cart.proceedToCheckout")}
          </Button>

          {/* Trust Badges */}
          <div className="pt-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Truck className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t("cart.freeShipping")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cart.freeShippingOver")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <RotateCcw className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t("cart.easyReturns")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cart.returnPolicy")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t("cart.securePayment")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cart.dataProtected")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

