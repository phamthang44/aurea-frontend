"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { StorefrontNavBar } from "@/components/shop/layout/StorefrontNavBar";
import { Button } from "@/components/ui/button";
import {
  OrderCard,
  OrderStatusTabs,
  OrderListSkeleton,
  EmptyOrdersState,
} from "@/components/shop/orders";

import {
  myOrdersApi,
  OrderSummary,
  OrderStatus,
  MyOrderSearchParams,
  ApiResult,
} from "@/lib/api/my-orders";

const PAGE_SIZE = 10;

export default function MyOrdersPage() {
  const { t } = useTranslation();

  // State
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch orders
  const fetchOrders = useCallback(
    async (params: MyOrderSearchParams, showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const result: ApiResult<OrderSummary[]> =
          await myOrdersApi.getMyOrders(params);

        if (result.error) {
          toast.error(
            result.error.message ||
              t("orders.errors.fetchFailed", {
                defaultValue: "Failed to fetch orders",
              }),
          );
          return;
        }

        // Clean ApiResult format: { data: [...], meta: {...} }
        setOrders(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalElements(
          result.meta?.totalElements || result.data?.length || 0,
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(
          t("orders.errors.fetchFailed", {
            defaultValue: "Failed to fetch orders",
          }),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t],
  );

  // Initial fetch and when filters change
  useEffect(() => {
    fetchOrders({
      page: currentPage,
      size: PAGE_SIZE,
      status: activeStatus,
      sort: "newest",
    });
  }, [currentPage, activeStatus, fetchOrders]);

  // Handle status change
  const handleStatusChange = (status: OrderStatus | "ALL") => {
    setActiveStatus(status);
    setCurrentPage(0); // Reset to first page
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders(
      {
        page: currentPage,
        size: PAGE_SIZE,
        status: activeStatus,
        sort: "newest",
      },
      false,
    );
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] dark:bg-[#09090b] text-gray-900 dark:text-white">
      {/* Gradient Blobs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 dark:from-purple-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-[#d4b483]/20 dark:from-[#d4b483]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300/20 dark:from-purple-800/10 to-transparent rounded-full blur-3xl" />
      </div>

      <StorefrontNavBar />

      <main className="flex-1 mt-24 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {t("orders.title", { defaultValue: "My Orders" })}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <p
              className="text-gray-600 dark:text-zinc-400"
              style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
            >
              {t("orders.subtitle", {
                defaultValue: "Track and manage your order history",
              })}
            </p>
          </motion.div>

          {/* Status Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <OrderStatusTabs
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
            />
          </motion.div>

          {/* Orders List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <OrderListSkeleton count={5} />
            ) : orders.length === 0 ? (
              <EmptyOrdersState />
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-500 dark:text-zinc-400">
                  {t("orders.showing", {
                    count: totalElements,
                    defaultValue: `Showing ${totalElements} order${totalElements !== 1 ? "s" : ""}`,
                  })}
                </div>

                {/* Order Cards */}
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 0 || isLoading}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t("common.previous", { defaultValue: "Previous" })}
                    </Button>

                    <span className="text-sm text-gray-600 dark:text-zinc-400">
                      {t("orders.pageInfo", {
                        current: currentPage + 1,
                        total: totalPages,
                        defaultValue: `Page ${currentPage + 1} of ${totalPages}`,
                      })}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="gap-1"
                    >
                      {t("common.next", { defaultValue: "Next" })}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
