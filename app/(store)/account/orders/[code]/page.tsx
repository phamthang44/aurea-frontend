"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  OrderStatusBadge,
  OrderProgressStepper,
  OrderDetailSkeleton,
  OrderItemCard,
  OrderShippingInfo,
  OrderPaymentInfo,
  OrderSummaryCard,
  OrderActions,
} from "@/components/shop/orders";

import { myOrdersApi, OrderDetail, OrderItem } from "@/lib/api/my-orders";
import { formatDate } from "@/lib/utils/order-formatters";

export default function OrderDetailPage() {
  const { t } = useTranslation();
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
            }),
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
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderCode, t]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Handle cancel order
  const handleCancelOrder = async (reason?: string) => {
    if (!orderCode) return;

    setIsCancelling(true);
    try {
      // TODO: Update API call to include reason
      // const result = await myOrdersApi.cancelOrder(orderCode, { reason });
      const result = await myOrdersApi.cancelOrder(orderCode);

      // Log reason for now (will be sent to backend later)
      if (reason) {
        console.log("Cancel reason:", reason);
      }

      if (result.error) {
        toast.error(
          result.error.message ||
            t("orders.errors.cancelFailed", {
              defaultValue: "Failed to cancel order",
            }),
        );
        return;
      }

      toast.success(
        t("orders.success.cancelled", {
          defaultValue: "Order cancelled successfully",
        }),
      );
      fetchOrderDetail();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        t("orders.errors.cancelFailed", {
          defaultValue: "Failed to cancel order",
        }),
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle re-order
  const handleReorder = () => {
    toast.info(
      t("orders.messages.reorderComingSoon", {
        defaultValue: "Re-order feature coming soon!",
      }),
    );
  };

  return (
    <div className="space-y-12">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/account/orders"
          className="group inline-flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors duration-300 no-underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5] group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-xs tracking-[0.15em] uppercase">
            {t("orders.backToOrders", { defaultValue: "All Orders" })}
          </span>
        </Link>
      </motion.div>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : !order ? (
        /* Order Not Found */
        <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 rounded-lg">
          <Package className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30 stroke-[1.5]" />
          <h2
            className="text-xl font-light tracking-wide text-foreground mb-2"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {t("orders.notFound", { defaultValue: "Order not found" })}
          </h2>
          <p className="text-sm text-muted-foreground/60 mb-8 max-w-md mx-auto">
            {t("orders.notFoundDesc", {
              defaultValue:
                "The order you're looking for doesn't exist or you don't have access to it.",
            })}
          </p>
          <Link href="/account/orders">
            <Button
              variant="outline"
              className="text-xs tracking-[0.15em] uppercase border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-transparent"
            >
              {t("orders.viewAllOrders", {
                defaultValue: "View All Orders",
              })}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Order Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="w-12 h-px bg-accent/60" />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1
                    className="text-2xl md:text-3xl font-light tracking-wide text-foreground"
                    style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                  >
                    {order.orderCode}
                  </h1>
                  <OrderStatusBadge status={order.status} size="lg" />
                </div>
                <p className="text-sm text-muted-foreground/60 tracking-wide">
                  {t("orders.placedOn", {
                    date: formatDate(order.createdAt),
                    defaultValue: `Placed on ${formatDate(order.createdAt)}`,
                  })}
                </p>
              </div>
            </div>
          </motion.header>

          {/* Progress Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <OrderProgressStepper status={order.status} />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Items & Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Order Items */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-accent/70 stroke-[1.5]" />
                  <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
                    {t("orders.items", { defaultValue: "Order Items" })}
                    <span className="ml-2 text-muted-foreground/40">
                      ({order.items?.length || 0})
                    </span>
                  </h2>
                </div>

                <div className="divide-y divide-black/5 dark:divide-white/10">
                  {order.items?.map((item: OrderItem, index: number) => (
                    <OrderItemCard key={item.id || index} item={item} />
                  ))}
                </div>
              </section>

              {/* Shipping Address & Contact */}
              {order.shippingAddress && (
                <OrderShippingInfo
                  address={order.shippingAddress}
                  contactEmail={order.contactEmail}
                />
              )}
            </motion.div>

            {/* Right Column - Summary & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="space-y-8"
            >
              {/* Payment Info */}
              <OrderPaymentInfo
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
              />

              {/* Order Summary */}
              <OrderSummaryCard
                subTotal={order.subTotal}
                shippingFee={order.shippingFee}
                discountAmount={order.discountAmount}
                finalAmount={order.finalAmount}
                note={order.note}
              />

              {/* Action Buttons */}
              <OrderActions
                status={order.status}
                isCancelling={isCancelling}
                onCancel={handleCancelOrder}
                onReorder={handleReorder}
              />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
