"use client";

import { useTranslation } from "react-i18next";

import { formatVND } from "@/lib/utils/order-formatters";

interface OrderSummaryCardProps {
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  note?: string;
}

/**
 * Reusable component for displaying order summary with totals
 */
export function OrderSummaryCard({
  subTotal,
  shippingFee,
  discountAmount,
  finalAmount,
  note,
}: OrderSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <section className="p-6 border border-black/10 dark:border-white/10 rounded-lg space-y-5">
        <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
          {t("orders.summary", { defaultValue: "Summary" })}
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground/60 tracking-wide">
              {t("orders.subtotal", { defaultValue: "Subtotal" })}
            </span>
            <span className="text-foreground/80 tracking-wide">
              {formatVND(subTotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground/60 tracking-wide">
              {t("orders.shippingFee", { defaultValue: "Shipping" })}
            </span>
            <span className="text-foreground/80 tracking-wide">
              {shippingFee === 0
                ? t("orders.free", { defaultValue: "Complimentary" })
                : formatVND(shippingFee)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/60 tracking-wide">
                {t("orders.discount", { defaultValue: "Discount" })}
              </span>
              <span className="text-accent tracking-wide">
                -{formatVND(discountAmount)}
              </span>
            </div>
          )}
          <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10">
            <div className="flex justify-between items-center">
              <span
                className="text-sm tracking-wide text-foreground"
                style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                }}
              >
                {t("orders.total", { defaultValue: "Total" })}
              </span>
              <span
                className="text-lg font-light text-accent tracking-wide"
                style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                }}
              >
                {formatVND(finalAmount)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Order Note */}
      {note && (
        <section className="p-6 border border-accent/20 bg-accent/[0.02] rounded-lg space-y-3">
          <h3 className="text-xs tracking-[0.2em] uppercase text-accent/70">
            {t("orders.note", { defaultValue: "Note" })}
          </h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {note}
          </p>
        </section>
      )}
    </div>
  );
}
