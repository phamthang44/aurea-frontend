"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/lib/store/hooks";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { Footer } from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CartItem } from "@/components/cart/CartItem";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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

export default function CartPage() {
  const { t } = useTranslation();
  const {
    items,
    totalAmount,
    loading,
    error,
    fetchCart,
    updateCartItem,
    removeCartItem,
    removeAllCartItems,
  } = useCart();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState("");
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  // Fetch cart from backend on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculate totals (use backend totalAmount if available, otherwise calculate)
  const subtotal = totalAmount || items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? (subtotal > 1000000 ? 0 : 30000) : 0; // Free shipping over 1M VND
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      toast.success(t("cart.quantityUpdated", { defaultValue: "Quantity updated" }));
    } catch (error) {
      toast.error(t("cart.updateFailed", { defaultValue: "Failed to update quantity" }));
    }
  };

  const handleRemoveItem = async (itemId: number, itemName: string) => {
    try {
      await removeCartItem(itemId);
      toast.success(t("cart.removedFromCartSuccess", { defaultValue: "Removed from cart successfully" }), {
        description: itemName,
      });
    } catch (error) {
      toast.error(t("cart.removeFailed", { defaultValue: "Failed to remove item" }));
    }
  };

  const handleClearCart = async () => {
    try {
      await removeAllCartItems();
      toast.success(t("cart.clearCartSuccess"));
    } catch (error) {
      toast.error(t("cart.clearCartFailedDescription", { defaultValue: "Failed to clear cart. Please try again" }));
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.error(t("cart.invalidCoupon"), {
        description: t("cart.couponExpired"),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LuxuryNavBar />

      {/* Confirm Clear Cart Dialog */}
      <ConfirmDialog
        open={showClearCartDialog}
        onOpenChange={setShowClearCartDialog}
        title={t("cart.clearCartTitle")}
        description={t("cart.clearCartDescription")}
        confirmText={t("cart.clearCart")}
        cancelText={t("cart.keepItems")}
        onConfirm={handleClearCart}
        variant="destructive"
      />

      <div className="flex-1 mt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors duration-200 no-underline group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              {t("cart.continueShopping")}
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-wider text-foreground mb-2">
              {t("cart.shoppingCart")}
            </h1>
            {!isAuthenticated && items.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <ShieldCheck className="inline h-4 w-4 mr-1 text-[#D4AF37]" />
                {t("cart.cartSavedLocally")}
              </p>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <ShoppingBag className="h-24 w-24 mx-auto text-[#D4AF37]/40" />
                </div>
                <h2 className="text-2xl font-light mb-3">{t("cart.emptyCartTitle")}</h2>
                <p className="text-muted-foreground mb-8">
                  {t("cart.emptyCartDescription")}
                </p>
                <Link href="/shop">
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-8">
                    {t("cart.startShopping")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Clear Cart Button */}
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearCartDialog(true)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("cart.clearCart")}
                  </Button>
                </div>

                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    loading={loading}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Order Summary */}
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
                        <span className="font-medium">
                          {formatVND(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">{t("cart.shipping")}</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">{t("cart.free")}</span>
                          ) : (
                            formatVND(shipping)
                          )}
                        </span>
                      </div>
                      {subtotal > 0 && subtotal < 1000000 && (
                        <p className="text-xs text-muted-foreground">
                          {t("cart.addMoreForFreeShipping", { amount: formatVND(1000000 - subtotal) })}
                        </p>
                      )}
                    </div>

                    <Separator className="bg-[#D4AF37]/20" />

                    {/* Total */}
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">{t("cart.total")}</span>
                      <span className="font-bold text-[#D4AF37]">
                        {formatVND(total)}
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-base font-medium tracking-wide disabled:opacity-50"
                      disabled={loading || items.some(item => {
                        const outOfStock = item.availableStock === 0 || item.availableStock === undefined;
                        const insufficient = item.availableStock !== undefined && item.availableStock > 0 && item.availableStock < item.quantity;
                        return outOfStock || insufficient;
                      })}
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.info(t("cart.pleaseSignIn"), {
                            description: t("cart.cartWillBeSaved"),
                          });
                        } else {
                          toast.info(t("cart.checkoutComingSoon"));
                        }
                      }}
                      title={
                        items.some(item => {
                          const outOfStock = item.availableStock === 0 || item.availableStock === undefined;
                          const insufficient = item.availableStock !== undefined && item.availableStock > 0 && item.availableStock < item.quantity;
                          return outOfStock || insufficient;
                        })
                          ? t("cart.removeOutOfStockItems", { defaultValue: "Please remove out of stock items before checkout" })
                          : undefined
                      }
                    >
                      {loading ? t("cart.loading", { defaultValue: "Loading..." }) : t("cart.proceedToCheckout")}
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
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
