"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { RefreshCcw, X, ShoppingBag, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { OrderStatus } from "@/lib/api/my-orders";

interface OrderActionsProps {
  status: OrderStatus;
  isCancelling?: boolean;
  onCancel: (reason?: string) => void;
  onReorder: () => void;
}

/**
 * Reusable component for order action buttons
 */
export function OrderActions({
  status,
  isCancelling = false,
  onCancel,
  onReorder,
}: OrderActionsProps) {
  const { t } = useTranslation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelSubmit = () => {
    onCancel(cancelReason.trim() || undefined);
    setCancelDialogOpen(false);
    setCancelReason("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCancelDialogOpen(open);
    if (!open) {
      setCancelReason("");
    }
  };

  // Normalize status to uppercase for comparison
  const normalizedStatus = status?.toUpperCase();

  return (
    <div className="space-y-3 pt-4">
      {/* Cancel Order - Only for PENDING status */}
      {normalizedStatus === "PENDING" && (
        <Dialog open={cancelDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-xs tracking-[0.15em] uppercase border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-black/30 dark:hover:border-white/30 hover:bg-muted/50 transition-all duration-300"
              disabled={isCancelling}
            >
              <X className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
              {isCancelling
                ? t("orders.cancelling", {
                    defaultValue: "Cancelling...",
                  })
                : t("orders.cancelOrder", {
                    defaultValue: "Cancel Order",
                  })}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-black/10 dark:border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[1.5]" />
                </div>
                <DialogTitle
                  className="font-light tracking-wide text-lg"
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                  }}
                >
                  {t("orders.confirmCancel", {
                    defaultValue: "Cancel this order?",
                  })}
                </DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground/70 text-sm">
                {t("orders.confirmCancelDesc", {
                  defaultValue:
                    "This action cannot be undone. Your order will be cancelled and you will need to place a new order if you change your mind.",
                })}
              </DialogDescription>
            </DialogHeader>

            {/* Cancel Reason Input */}
            <div className="space-y-3 py-4">
              <Label
                htmlFor="cancel-reason"
                className="text-xs tracking-[0.1em] uppercase text-muted-foreground/70"
              >
                {t("orders.cancelReason", {
                  defaultValue: "Reason for cancellation",
                })}
                <span className="ml-1 text-muted-foreground/40 normal-case tracking-normal">
                  ({t("common.optional", { defaultValue: "optional" })})
                </span>
              </Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("orders.cancelReasonPlaceholder", {
                  defaultValue:
                    "Please let us know why you're cancelling this order...",
                })}
                className="min-h-[100px] resize-none text-sm border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 focus-visible:ring-black/10 dark:focus-visible:ring-white/10"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground/50 text-right">
                {cancelReason.length}/500
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                className="w-full sm:w-auto text-xs tracking-[0.1em] uppercase border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-transparent"
              >
                {t("orders.keepOrder", { defaultValue: "Keep Order" })}
              </Button>
              <Button
                type="button"
                onClick={handleCancelSubmit}
                disabled={isCancelling}
                className="w-full sm:w-auto text-xs tracking-[0.1em] uppercase bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
              >
                {isCancelling ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t("orders.cancelling", { defaultValue: "Cancelling..." })}
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
                    {t("orders.yesCancel", {
                      defaultValue: "Yes, Cancel Order",
                    })}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Re-order - Only for COMPLETED status */}
      {normalizedStatus === "COMPLETED" && (
        <Button
          onClick={onReorder}
          className="w-full text-xs tracking-[0.15em] uppercase bg-foreground text-background hover:bg-foreground/90"
        >
          <RefreshCcw className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
          {t("orders.reorder", { defaultValue: "Order Again" })}
        </Button>
      )}

      {/* Continue Shopping */}
      <Link href="/shop" className="block">
        <Button
          variant="outline"
          className="w-full text-xs tracking-[0.15em] uppercase border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:bg-transparent"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
          {t("orders.continueShopping", {
            defaultValue: "Continue Shopping",
          })}
        </Button>
      </Link>
    </div>
  );
}
