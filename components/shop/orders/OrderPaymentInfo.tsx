"use client";

import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";

import {
  getPaymentMethodLabel,
  getPaymentStatusStyle,
} from "@/lib/utils/order-formatters";

interface OrderPaymentInfoProps {
  paymentMethod: string;
  paymentStatus: string;
}

/**
 * Reusable component for displaying payment information
 */
export function OrderPaymentInfo({
  paymentMethod,
  paymentStatus,
}: OrderPaymentInfoProps) {
  const { t } = useTranslation();
  const statusStyle = getPaymentStatusStyle(paymentStatus);

  return (
    <section className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-5">
      <div className="flex items-center gap-3">
        <CreditCard className="w-4 h-4 text-accent/70 stroke-[1.5]" />
        <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
          {t("orders.paymentInfo", {
            defaultValue: "Payment",
          })}
        </h2>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground/60 tracking-wide">
            {t("orders.method", { defaultValue: "Method" })}
          </span>
          <span className="text-foreground tracking-wide">
            {getPaymentMethodLabel(paymentMethod)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground/60 tracking-wide">
            {t("orders.paymentStatus", { defaultValue: "Status" })}
          </span>
          <span className={`tracking-wide ${statusStyle.className}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>
    </section>
  );
}
