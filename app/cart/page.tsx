"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAppSelector } from "@/lib/store/hooks";
import { LuxuryNavBar } from "@/components/NavBar/LuxuryNavBar";
import { Footer } from "@/components/store/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { productApi } from "@/lib/api/product";

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
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateItemStock = useCartStore((state) => state.updateItemStock);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState("");
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? (subtotal > 1000000 ? 0 : 30000) : 0; // Free shipping over 1M VND
  const total = subtotal + shipping;

  // Fetch current stock status for cart items that don't have stock info
  useEffect(() => {
    const fetchStockInfo = async () => {
      // Only fetch for items missing stock info
      const itemsNeedingStock = items.filter(
        (item) => item.inStock === undefined || item.availableStock === undefined
      );

      if (itemsNeedingStock.length === 0) {
        return; // All items already have stock info
      }

      setIsLoadingStock(true);
      console.log(`[Cart] Fetching stock info for ${itemsNeedingStock.length} item(s)`);

      try {
        // Fetch stock info for all items in parallel
        const stockPromises = itemsNeedingStock.map(async (item) => {
          try {
            const result = await productApi.getProductById(item.id);
            if (result.data) {
              const product = result.data;
              const inStock = product.inStock ?? false;
              const availableStock = product.availableStock ?? 0;
              
              console.log(`[Cart] Updated stock for ${item.name}:`, {
                inStock,
                availableStock,
                previous: { inStock: item.inStock, availableStock: item.availableStock }
              });
              
              updateItemStock(item.id, inStock, availableStock);
            }
          } catch (error) {
            console.error(`[Cart] Failed to fetch stock for item ${item.id}:`, error);
            // Don't update stock if fetch fails - keep existing state
          }
        });

        await Promise.all(stockPromises);
      } catch (error) {
        console.error("[Cart] Error fetching stock info:", error);
      } finally {
        setIsLoadingStock(false);
      }
    };

    if (items.length > 0) {
      fetchStockInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map(i => i.id).join(',')]); // Only run when item IDs change

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    toast.success(t("cart.removedFromCart"), {
      description: itemName,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success(t("cart.cartCleared"));
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

                {items.map((item) => {
                  // Check if item is out of stock (use inStock from ProductListingDto)
                  // Explicitly check for false (undefined/null means we don't have stock info yet, treat as in stock for backward compatibility)
                  // Also check if availableStock is 0 as a fallback
                  const isOutOfStock = item.inStock === false || 
                                      (item.inStock === undefined && item.availableStock === 0);
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-4 bg-card border-2 rounded-lg transition-all duration-300 ${
                        isOutOfStock
                          ? "border-destructive/30 hover:border-destructive/50 opacity-75"
                          : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-32 flex-shrink-0 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525] rounded-lg overflow-hidden border border-[#D4AF37]/20">
                        {item.imageUrl && !imageErrors.has(item.id) ? (
                          <>
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                              onError={() => {
                                // Track this image as failed
                                setImageErrors((prev) => new Set(prev).add(item.id));
                              }}
                            />
                            {/* Sold Out Overlay - Must be above image with higher z-index */}
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-20 pointer-events-none">
                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-destructive text-white rounded-md shadow-lg">
                                  {t("cart.soldOut")}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525]">
                            <ShoppingBag className="h-8 w-8 text-[#D4AF37]/30 mb-2" />
                            <p className="text-[10px] font-light text-[#D4AF37]/50 tracking-wider text-center px-1">
                              {t("cart.noImage", { defaultValue: "No Image" })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {item.brand && (
                            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#D4AF37] mb-1">
                              {item.brand}
                            </p>
                          )}
                          <h3 className="text-base font-normal mb-2">
                            {item.name}
                            {item.variantAttributes && (
                              <span className="text-xs text-muted-foreground ml-2 font-normal">
                                ({Object.values(item.variantAttributes).join(", ")})
                              </span>
                            )}
                          </h3>
                          <p className="text-base font-semibold text-[#D4AF37]">
                            {formatVND(item.price)}
                          </p>
                          {/* Stock Status Warning */}
                          {isOutOfStock && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1 font-medium">
                              <span>⚠️</span>
                              <span>{t("cart.soldOut")}</span>
                            </p>
                          )}
                          {/* Show warning if stock info is missing (for debugging) */}
                          {item.inStock === undefined && process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              [Dev] Stock info not available
                            </p>
                          )}
                          {!isOutOfStock && item.availableStock !== undefined && item.availableStock < 10 && (
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
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
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
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={isOutOfStock || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                              className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10 disabled:opacity-50"
                              title={
                                isOutOfStock
                                  ? t("cart.soldOut", { defaultValue: "Sold Out" })
                                  : item.availableStock !== undefined && item.quantity >= item.availableStock
                                  ? t("cart.maxStockReached", { defaultValue: "Maximum stock reached" })
                                  : undefined
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.remove")}
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${isOutOfStock ? "text-muted-foreground line-through" : "text-[#D4AF37]"}`}>
                          {formatVND(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
                      disabled={items.some(item => item.inStock === false)}
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
                        items.some(item => item.inStock === false)
                          ? t("cart.removeOutOfStockItems", { defaultValue: "Please remove out of stock items before checkout" })
                          : undefined
                      }
                    >
                      {t("cart.proceedToCheckout")}
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
