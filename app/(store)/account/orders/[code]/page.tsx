"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  CreditCard,
  Package,
  RefreshCcw,
  X,
  ShoppingBag,
  Mail,
} from "lucide-react";

import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { StorefrontFooter } from "@/components/shop/layout/StorefrontFooter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  OrderStatusBadge,
  OrderProgressStepper,
  OrderDetailSkeleton,
} from "@/components/shop/orders";

import {
  myOrdersApi,
  OrderDetail,
  OrderItem,
} from "@/lib/api/my-orders";

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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get payment method display name
 */
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    COD: "Cash on Delivery",
    BANK_TRANSFER: "Bank Transfer",
    VN_PAY: "VNPay",
    MOMO: "MoMo",
    E_WALLET: "E-Wallet",
  };
  return labels[method] || method;
}

/**
 * Get payment status styling
 */
function getPaymentStatusStyle(status: string): { label: string; className: string } {
  const styles: Record<string, { label: string; className: string }> = {
    PAID: {
      label: "Paid",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    UNPAID: {
      label: "Unpaid",
      className: "text-amber-600 dark:text-amber-400",
    },
    PENDING: {
      label: "Pending",
      className: "text-blue-600 dark:text-blue-400",
    },
    FAILED: {
      label: "Failed",
      className: "text-red-600 dark:text-red-400",
    },
    REFUNDED: {
      label: "Refunded",
      className: "text-gray-600 dark:text-gray-400",
    },
  };
  return styles[status] || { label: status, className: "text-gray-600" };
}

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const orderCode = params.code as string;

  // State
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch order detail
  const fetchOrderDetail = useCallback(async () => {
    if (!orderCode) return;

    setIsLoading(true);
    try {
      const result = await myOrdersApi.getMyOrderDetail(orderCode);

      if (result.error) {
        toast.error(
          result.error.message ||
            t("orders.errors.fetchDetailFailed", {
              defaultValue: "Failed to fetch order details",
            })
        );
        return;
      }

      // Handle nested response structure
      const orderData = (result.data as any)?.data || result.data;
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(
        t("orders.errors.fetchDetailFailed", {
          defaultValue: "Failed to fetch order details",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderCode, t]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!orderCode) return;

    setIsCancelling(true);
    try {
      const result = await myOrdersApi.cancelOrder(orderCode);

      if (result.error) {
        toast.error(
          result.error.message ||
            t("orders.errors.cancelFailed", {
              defaultValue: "Failed to cancel order",
            })
        );
        return;
      }

      toast.success(
        t("orders.success.cancelled", {
          defaultValue: "Order cancelled successfully",
        })
      );
      fetchOrderDetail(); // Refresh order data
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        t("orders.errors.cancelFailed", {
          defaultValue: "Failed to cancel order",
        })
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle re-order
  const handleReorder = () => {
    // TODO: Implement re-order functionality
    // This would add all items from this order back to the cart
    toast.info(
      t("orders.messages.reorderComingSoon", {
        defaultValue: "Re-order feature coming soon!",
      })
    );
  };

  const paymentStatusStyle = order
    ? getPaymentStatusStyle(order.paymentStatus)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] dark:bg-[#09090b] text-gray-900 dark:text-white">
      {/* Gradient Blobs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 dark:from-purple-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/20 dark:from-[#d4b483]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <StorefrontNavBar />

      <main className="flex-1 mt-24 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-[#D4AF37] transition-colors no-underline group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">
                {t("orders.backToOrders", { defaultValue: "Back to Orders" })}
              </span>
            </Link>
          </motion.div>

          {isLoading ? (
            <OrderDetailSkeleton />
          ) : !order ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {t("orders.notFound", { defaultValue: "Order not found" })}
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 mb-6">
                {t("orders.notFoundDesc", {
                  defaultValue:
                    "The order you're looking for doesn't exist or you don't have access to it.",
                })}
              </p>
              <Link href="/account/orders">
                <Button variant="outline">
                  {t("orders.viewAllOrders", { defaultValue: "View All Orders" })}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Order Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-start justify-between gap-4 mb-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {order.orderCode}
                    </h1>
                    <OrderStatusBadge status={order.status} size="lg" />
                  </div>
                  <p className="text-gray-500 dark:text-zinc-400">
                    {t("orders.placedOn", {
                      date: formatDate(order.createdAt),
                      defaultValue: `Placed on ${formatDate(order.createdAt)}`,
                    })}
                  </p>
                </div>
              </motion.div>

              {/* Progress Stepper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <OrderProgressStepper status={order.status} />
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Items & Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2 space-y-6"
                >
                  {/* Order Items */}
                  <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                      {t("orders.items", { defaultValue: "Order Items" })}
                      <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">
                        ({order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "item" : "items"})
                      </span>
                    </h2>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {order.items?.map((item: OrderItem, index: number) => (
                        <div
                          key={item.id || index}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          {/* Product Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 border border-gray-200 dark:border-zinc-700">
                            {item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${item.productSlug || item.productId}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-[#D4AF37] transition-colors no-underline line-clamp-2"
                            >
                              {item.productName}
                            </Link>
                            <div className="mt-1 text-sm text-gray-500 dark:text-zinc-400 space-y-0.5">
                              {(item.size || item.color) && (
                                <p>
                                  {item.size && (
                                    <span>
                                      {t("orders.size", { defaultValue: "Size" })}:{" "}
                                      {item.size}
                                    </span>
                                  )}
                                  {item.size && item.color && " • "}
                                  {item.color && (
                                    <span>
                                      {t("orders.color", { defaultValue: "Color" })}:{" "}
                                      {item.color}
                                    </span>
                                  )}
                                </p>
                              )}
                              <p>
                                {t("orders.quantity", { defaultValue: "Qty" })}:{" "}
                                {item.quantity} × {formatVND(item.unitPrice)}
                              </p>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatVND(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#D4AF37]" />
                      {t("orders.shippingAddress", {
                        defaultValue: "Shipping Address",
                      })}
                    </h2>
                    {order.shippingAddress && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {order.shippingAddress.recipientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-zinc-400">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 dark:text-zinc-400">
                            {order.shippingAddress.detailAddress},{" "}
                            {order.shippingAddress.wardName},{" "}
                            {order.shippingAddress.districtName},{" "}
                            {order.shippingAddress.provinceName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Email (if available) */}
                  {order.contactEmail && (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#D4AF37]" />
                        {t("orders.contactEmail", {
                          defaultValue: "Contact Email",
                        })}
                      </h2>
                      <p className="text-gray-600 dark:text-zinc-400">
                        {order.contactEmail}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Right Column - Summary & Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* Payment Info */}
                  <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                      {t("orders.paymentInfo", { defaultValue: "Payment Info" })}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">
                          {t("orders.method", { defaultValue: "Method" })}
                        </span>
                        <span className="font-medium">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">
                          {t("orders.paymentStatus", { defaultValue: "Status" })}
                        </span>
                        <span className={`font-medium ${paymentStatusStyle?.className}`}>
                          {paymentStatusStyle?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      {t("orders.summary", { defaultValue: "Order Summary" })}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                        <span>{t("orders.subtotal", { defaultValue: "Subtotal" })}</span>
                        <span>{formatVND(order.subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                        <span>
                          {t("orders.shippingFee", { defaultValue: "Shipping" })}
                        </span>
                        <span>
                          {order.shippingFee === 0
                            ? t("orders.free", { defaultValue: "Free" })
                            : formatVND(order.shippingFee)}
                        </span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>
                            {t("orders.discount", { defaultValue: "Discount" })}
                          </span>
                          <span>-{formatVND(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="pt-3 mt-3 border-t border-gray-200 dark:border-zinc-700">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                            {t("orders.total", { defaultValue: "Total" })}
                          </span>
                          <span className="text-xl font-bold text-[#D4AF37]">
                            {formatVND(order.finalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Note (if available) */}
                  {order.note && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-6">
                      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
                        {t("orders.note", { defaultValue: "Order Note" })}
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        {order.note}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Cancel Order - Only for PENDING status */}
                    {order.status === "PENDING" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            disabled={isCancelling}
                          >
                            <X className="w-4 h-4 mr-2" />
                            {isCancelling
                              ? t("orders.cancelling", {
                                  defaultValue: "Cancelling...",
                                })
                              : t("orders.cancelOrder", {
                                  defaultValue: "Cancel Order",
                                })}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("orders.confirmCancel", {
                                defaultValue: "Cancel this order?",
                              })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("orders.confirmCancelDesc", {
                                defaultValue:
                                  "This action cannot be undone. Your order will be cancelled and you will need to place a new order if you change your mind.",
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel", { defaultValue: "Keep Order" })}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelOrder}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t("orders.yesCancel", {
                                defaultValue: "Yes, Cancel Order",
                              })}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Re-order - Only for COMPLETED status */}
                    {order.status === "COMPLETED" && (
                      <Button
                        onClick={handleReorder}
                        className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        {t("orders.reorder", { defaultValue: "Order Again" })}
                      </Button>
                    )}

                    {/* Continue Shopping */}
                    <Link href="/shop" className="block">
                      <Button variant="outline" className="w-full">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {t("orders.continueShopping", {
                          defaultValue: "Continue Shopping",
                        })}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
