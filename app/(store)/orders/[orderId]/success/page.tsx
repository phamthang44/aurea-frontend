"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, CreditCard, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { StorefrontFooter } from "@/components/shop/layout/StorefrontFooter";
import { useTranslation } from "react-i18next";
import { OrderCreationResponse } from "@/lib/api/order";
import Image from "next/image";

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
      .replace(/,/g, ".") + "₫"
  );
}

function OrderSuccessContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  
  const [orderData, setOrderData] = useState<OrderCreationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load order data from sessionStorage
    // TODO: Replace with API call to GET /orders/{orderId} when backend endpoint is available
    if (orderId && typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`order_${orderId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored) as OrderCreationResponse;
          setOrderData(data);
        } catch (error) {
          console.error("Failed to parse order data:", error);
        }
      }
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#d4b483] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-zinc-400">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b]">
        <StorefrontNavBar />
        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">
              Unable to load order details
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#181818] dark:bg-white text-white dark:text-black hover:scale-105 transition-all duration-300 rounded-lg"
            >
              {t("shop.backToHome") || "Back to Shop"}
            </Link>
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  const { orderId: id, orderCode, status, totalAmount, itemSummary, paymentInfo } = orderData;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Gradient Blobs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/40 dark:from-purple-900/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/30 dark:from-[#d4b483]/20 to-transparent rounded-full blur-3xl" />
      </div>

      <StorefrontNavBar />

      <div className="flex-1 mt-20 relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
            </motion.div>
            <h1
              className="text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] mb-4 text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {t("checkout.success.orderCreated")}
            </h1>
            <p
              className="text-gray-600 dark:text-zinc-400 text-lg"
              style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
            >
              {t("checkout.orderConfirmationDescription", {
                defaultValue: "Your order has been placed successfully. We will process it shortly.",
              })}
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="backdrop-blur-2xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-6 shadow-xl dark:shadow-2xl mb-8"
          >
            {/* Order Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
                <div>
                  <p
                    className="text-sm text-gray-600 dark:text-zinc-400 mb-1"
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {t("checkout.orderNumber", { defaultValue: "Order Number" })}
                  </p>
                  <p
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {orderCode || id}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm text-gray-600 dark:text-zinc-400 mb-1"
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {t("checkout.orderStatus", { defaultValue: "Status" })}
                  </p>
                  <span
                    className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                    style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <p
                  className="text-sm text-gray-600 dark:text-zinc-400 mb-2"
                  style={{
                    fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                  }}
                >
                  {t("checkout.orderSummary")}
                </p>
                <p
                  className="text-base text-gray-900 dark:text-white"
                  style={{
                    fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                  }}
                >
                  {itemSummary}
                </p>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <p
                  className="text-lg font-medium text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {t("checkout.total")}
                </p>
                <p
                  className="text-2xl font-bold text-[#d4b483]"
                  style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {formatVND(totalAmount)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Information */}
          {paymentInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="backdrop-blur-2xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-4 shadow-xl dark:shadow-2xl mb-8"
            >
              <h3
                className="text-xl font-bold text-gray-900 dark:text-white mb-4"
                style={{ fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {t("checkout.paymentInformation", {
                  defaultValue: "Payment Information",
                })}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm text-gray-600 dark:text-zinc-400"
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {t("checkout.paymentMethod")}
                  </p>
                  <p
                    className="text-base font-medium text-gray-900 dark:text-white"
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {paymentInfo.paymentMethod === "COD"
                      ? t("checkout.cashOnDelivery")
                      : paymentInfo.paymentMethod === "BANK_TRANSFER"
                      ? t("checkout.bankingTransfer")
                      : paymentInfo.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p
                    className="text-sm text-gray-600 dark:text-zinc-400"
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {t("checkout.paymentStatus", {
                      defaultValue: "Payment Status",
                    })}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      paymentInfo.paymentStatus === "PAID"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : paymentInfo.paymentStatus === "PENDING"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                    style={{
                      fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                    }}
                  >
                    {paymentInfo.paymentStatus}
                  </span>
                </div>

                {/* QR Code for BANK_TRANSFER */}
                {paymentInfo.paymentMethod === "BANK_TRANSFER" &&
                  paymentInfo.qrCodeUrl && (
                    <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                      <p
                        className="text-sm text-gray-600 dark:text-zinc-400 mb-3"
                        style={{
                          fontFamily: "var(--font-be-vietnam-pro), sans-serif",
                        }}
                      >
                        {t("checkout.scanQRCode", {
                          defaultValue: "Scan QR code to pay",
                        })}
                      </p>
                      <div className="relative w-64 h-64 mx-auto bg-white p-4 rounded-lg">
                        <Image
                          src={paymentInfo.qrCodeUrl}
                          alt="Payment QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                {/* Payment URL for online payments */}
                {paymentInfo.paymentUrl && (
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <a
                      href={paymentInfo.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full px-6 py-3 bg-[#181818] dark:bg-white text-white dark:text-black hover:scale-105 transition-all duration-300 rounded-lg text-center font-medium"
                      style={{
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {t("checkout.proceedToPayment", {
                        defaultValue: "Proceed to Payment",
                      })}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:scale-105 transition-all duration-300 rounded-lg font-medium"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              <ArrowLeft className="h-5 w-5" />
              {t("shop.backToHome") || "Continue Shopping"}
            </Link>
            <Link
              href={`/account/orders/${id}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#181818] dark:bg-white text-white dark:text-black hover:scale-105 transition-all duration-300 rounded-lg font-medium"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              <Package className="h-5 w-5" />
              {t("checkout.viewOrderDetails", {
                defaultValue: "View Order Details",
              })}
            </Link>
          </motion.div>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-[#d4b483] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-zinc-400">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

