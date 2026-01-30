"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Ticket, History, ChevronRight, Gift, Calendar, Percent, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserVoucher } from "@/lib/types/profile";

interface AureaFeaturesCardProps {
  vouchers: UserVoucher[];
  isLoading?: boolean;
}

export function AureaFeaturesCard({ vouchers, isLoading }: AureaFeaturesCardProps) {
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
    }).format(voucher.discountValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-lg font-light tracking-wide text-foreground">
          {t("profile.aurea.title", { defaultValue: "Rewards & History" })}
        </h2>
      </div>

      <div className="space-y-6">
        {/* My Vouchers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {t("profile.aurea.myVouchers", { defaultValue: "My Vouchers" })}
              </span>
            </div>
            {activeVouchers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                {activeVouchers.length} {t("profile.aurea.available", { defaultValue: "available" })}
              </span>
            )}
          </div>

          {/* Voucher Cards */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : activeVouchers.length > 0 ? (
            <div className="space-y-2">
              {activeVouchers.slice(0, 3).map((voucher) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "relative overflow-hidden rounded-lg border border-border",
                    "bg-gradient-to-r from-accent/5 to-transparent",
                    "p-3"
                  )}
                >
                  {/* Voucher Content */}
                  <div className="flex items-center gap-3">
                    {/* Discount Badge */}
                    <div className="shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                      {voucher.discountType === "PERCENTAGE" ? (
                        <Percent className="w-4 h-4 text-accent mb-1" />
                      ) : (
                        <Banknote className="w-4 h-4 text-accent mb-1" />
                      )}
                      <span className="text-lg font-semibold text-accent">
                        {formatDiscount(voucher)}
                      </span>
                    </div>

                    {/* Voucher Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {voucher.code}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {voucher.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {t("profile.aurea.validUntil", { defaultValue: "Valid until" })}: {formatDate(voucher.validUntil)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-accent/20 rounded-bl-2xl" />
                </motion.div>
              ))}

              {activeVouchers.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-accent"
                >
                  {t("profile.aurea.viewAll", { defaultValue: "View all vouchers" })} ({activeVouchers.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {t("profile.aurea.noVouchers", { defaultValue: "No vouchers available" })}
              </p>
              <p className="text-xs mt-1">
                {t("profile.aurea.noVouchersDesc", { defaultValue: "Check back later for special offers!" })}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Transaction History Link */}
        <Link
          href="/account/orders"
          className="flex items-center justify-between py-2 group no-underline"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {t("profile.aurea.viewHistory", { defaultValue: "View Transaction History" })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.aurea.viewHistoryDesc", { defaultValue: "View your order and inventory ledger" })}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </motion.div>
  );
}
