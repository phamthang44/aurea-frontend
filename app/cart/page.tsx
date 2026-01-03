"use client";

import { useState } from "react";
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
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [couponCode, setCouponCode] = useState("");
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? (subtotal > 1000000 ? 0 : 30000) : 0; // Free shipping over 1M VND
  const total = subtotal + shipping;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId);
    toast.success("Removed from cart", {
      description: itemName,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.error("Invalid coupon code", {
        description: "This coupon does not exist or has expired.",
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
        title="Clear Shopping Cart"
        description="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Keep Items"
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
              Continue Shopping
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-wider text-foreground mb-2">
              Shopping Cart
            </h1>
            {!isAuthenticated && items.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <ShieldCheck className="inline h-4 w-4 mr-1 text-[#D4AF37]" />
                Your cart is saved locally. Sign in to sync across devices.
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
                <h2 className="text-2xl font-light mb-3">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Discover our luxury collection and add items to your cart
                </p>
                <Link href="/shop">
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-8">
                    Start Shopping
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
                    Clear Cart
                  </Button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-card border-2 border-[#D4AF37]/20 rounded-lg hover:border-[#D4AF37]/40 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-32 flex-shrink-0 bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] dark:from-[#1A1A1A] dark:to-[#252525] rounded-lg overflow-hidden border border-[#D4AF37]/20">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-8 w-8 text-[#D4AF37]/30" />
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
                        </h3>
                        <p className="text-base font-semibold text-[#D4AF37]">
                          {formatVND(item.price)}
                        </p>
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
                            className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10"
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
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#D4AF37]">
                        {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-card border-2 border-[#D4AF37]/30 rounded-lg p-6 space-y-6">
                    <h2 className="text-xl font-light tracking-wider">
                      Order Summary
                    </h2>

                    <Separator className="bg-[#D4AF37]/20" />

                    {/* Coupon Code */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="border-[#D4AF37]/30"
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-[#D4AF37]/20" />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          {formatVND(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatVND(shipping)
                          )}
                        </span>
                      </div>
                      {subtotal > 0 && subtotal < 1000000 && (
                        <p className="text-xs text-muted-foreground">
                          Add {formatVND(1000000 - subtotal)} more for free
                          shipping
                        </p>
                      )}
                    </div>

                    <Separator className="bg-[#D4AF37]/20" />

                    {/* Total */}
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-[#D4AF37]">
                        {formatVND(total)}
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white h-12 text-base font-medium tracking-wide"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.info("Please sign in to checkout", {
                            description: "Your cart will be saved",
                          });
                        } else {
                          toast.info("Checkout coming soon!");
                        }
                      }}
                    >
                      Proceed to Checkout
                    </Button>

                    {/* Trust Badges */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Truck className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Free Shipping</p>
                          <p className="text-xs text-muted-foreground">
                            On orders over 1,000,000₫
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <RotateCcw className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Easy Returns</p>
                          <p className="text-xs text-muted-foreground">
                            30-day return policy
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <ShieldCheck className="h-5 w-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Secure Payment</p>
                          <p className="text-xs text-muted-foreground">
                            Your data is protected
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
