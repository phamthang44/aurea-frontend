"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Ticket,
  History,
  ChevronRight,
  Calendar,
  Percent,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { UserVoucher } from "@/lib/types/profile";

interface AureaFeaturesCardProps {
  vouchers: UserVoucher[];
  isLoading?: boolean;
}

export function AureaFeaturesCard({
  vouchers,
  isLoading,
}: AureaFeaturesCardProps) {
  const { t } = useTranslation();

  // Filter active vouchers (not used and not expired)
  const activeVouchers = vouchers.filter((v) => {
    const now = new Date();
    const validUntil = new Date(v.validUntil);
    return !v.isUsed && validUntil > now;
  });

  const formatDiscount = (voucher: UserVoucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(voucher.discountValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="space-y-2">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60"
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          Benefits
        </p>
        <h2
          className="text-xl md:text-2xl font-light tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {t("profile.aurea.title", { defaultValue: "Rewards & Privileges" })}
        </h2>
      </div>

      <div className="space-y-10">
        {/* Vouchers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 text-muted-foreground/50 stroke-[1.5]" />
              <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground/70">
                {t("profile.aurea.myVouchers", {
                  defaultValue: "Available Offers",
                })}
              </span>
            </div>
            {activeVouchers.length > 0 && (
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent">
                {activeVouchers.length}{" "}
                {t("profile.aurea.available", { defaultValue: "active" })}
              </span>
            )}
          </div>

          {/* Voucher List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : activeVouchers.length > 0 ? (
            <div className="space-y-4">
              {activeVouchers.slice(0, 3).map((voucher, index) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "group relative flex items-stretch border border-border/40",
                    "hover:border-accent/30 transition-colors duration-500",
                  )}
                >
                  {/* Discount Value - Left Panel */}
                  <div className="shrink-0 w-24 flex flex-col items-center justify-center py-5 px-4 border-r border-dashed border-border/40 bg-muted/10">
                    {voucher.discountType === "PERCENTAGE" ? (
                      <Percent className="w-3.5 h-3.5 text-accent/70 mb-1 stroke-[1.5]" />
                    ) : (
                      <Banknote className="w-3.5 h-3.5 text-accent/70 mb-1 stroke-[1.5]" />
                    )}
                    <span
                      className="text-lg font-light text-foreground tracking-wide"
                      style={{
                        fontFamily: "var(--font-serif), Georgia, serif",
                      }}
                    >
                      {formatDiscount(voucher)}
                    </span>
                    <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-1">
                      {voucher.discountType === "PERCENTAGE" ? "off" : "value"}
                    </span>
                  </div>

                  {/* Voucher Details - Right Panel */}
                  <div className="flex-1 py-4 px-5 space-y-2">
                    <p className="text-sm font-medium text-foreground tracking-wide">
                      {voucher.code}
                    </p>
                    <p className="text-xs text-muted-foreground/70 line-clamp-1">
                      {voucher.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground/50">
                      <Calendar className="w-3 h-3 stroke-[1.5]" />
                      <span>Expires {formatDate(voucher.validUntil)}</span>
                    </div>
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-accent/40 group-hover:w-full transition-all duration-700 ease-out" />
                </motion.div>
              ))}

              {activeVouchers.length > 3 && (
                <button className="w-full py-3 text-xs tracking-[0.2em] uppercase text-muted-foreground/60 hover:text-accent transition-colors duration-300 border border-dashed border-border/30 hover:border-accent/30">
                  {t("profile.aurea.viewAll", {
                    defaultValue: "View all offers",
                  })}{" "}
                  ({activeVouchers.length})
                </button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-border/30">
              <Ticket className="w-6 h-6 mx-auto mb-3 text-muted-foreground/30 stroke-[1.5]" />
              <p className="text-sm text-muted-foreground/60 tracking-wide">
                {t("profile.aurea.noVouchers", {
                  defaultValue: "No offers available",
                })}
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1.5 tracking-wide">
                {t("profile.aurea.noVouchersDesc", {
                  defaultValue: "Exclusive offers will appear here",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30" />

        {/* Transaction History Link */}
        <Link
          href="/account/orders"
          className="group flex items-center justify-between py-3 no-underline"
        >
          <div className="flex items-center gap-4">
            <History className="w-4 h-4 text-muted-foreground/50 stroke-[1.5]" />
            <div className="space-y-1">
              <p className="text-sm text-foreground tracking-wide group-hover:text-accent transition-colors duration-300">
                {t("profile.aurea.viewHistory", {
                  defaultValue: "Order History",
                })}
              </p>
              <p className="text-xs text-muted-foreground/50 tracking-wide">
                {t("profile.aurea.viewHistoryDesc", {
                  defaultValue: "View past orders and transactions",
                })}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
}
