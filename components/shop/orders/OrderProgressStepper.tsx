"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/api/my-orders";
import { useTranslation } from "react-i18next";

interface OrderProgressStepperProps {
  status: OrderStatus;
  className?: string;
}

interface Step {
  key: string;
  labelKey: string;
  statuses: OrderStatus[];
}

const steps: Step[] = [
  { key: "placed", labelKey: "orders.progress.placed", statuses: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"] },
  { key: "confirmed", labelKey: "orders.progress.confirmed", statuses: ["CONFIRMED", "SHIPPING", "COMPLETED"] },
  { key: "shipping", labelKey: "orders.progress.shipping", statuses: ["SHIPPING", "COMPLETED"] },
  { key: "completed", labelKey: "orders.progress.completed", statuses: ["COMPLETED"] },
];

function getActiveStepIndex(status: OrderStatus): number {
  if (status === "CANCELLED" || status === "RETURNED") return -1;
  
  switch (status) {
    case "PENDING": return 0;
    case "CONFIRMED": return 1;
    case "SHIPPING": return 2;
    case "COMPLETED": return 3;
    default: return 0;
  }
}

export function OrderProgressStepper({ status, className }: OrderProgressStepperProps) {
  const { t } = useTranslation();
  const activeIndex = getActiveStepIndex(status);
  const isCancelled = status === "CANCELLED" || status === "RETURNED";

  if (isCancelled) {
    return (
      <div className={cn("p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-lg">✕</span>
          </div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-400">
              {status === "CANCELLED" 
                ? t("orders.status.cancelled", { defaultValue: "Order Cancelled" })
                : t("orders.status.returned", { defaultValue: "Order Returned" })
              }
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              {status === "CANCELLED"
                ? t("orders.messages.cancelledDesc", { defaultValue: "This order has been cancelled." })
                : t("orders.messages.returnedDesc", { defaultValue: "This order has been returned." })
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <div key={step.key} className="flex-1 flex items-center">
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300",
                    isCompleted && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    isActive && "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30 ring-4 ring-[#D4AF37]/20",
                    isPending && "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-3 text-xs font-medium text-center whitespace-nowrap",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isActive && "text-[#D4AF37]",
                    isPending && "text-gray-400 dark:text-zinc-500"
                  )}
                >
                  {t(step.labelKey, { defaultValue: step.key.charAt(0).toUpperCase() + step.key.slice(1) })}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 relative overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500",
                      isCompleted && "w-full",
                      isActive && "w-1/2",
                      isPending && "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
