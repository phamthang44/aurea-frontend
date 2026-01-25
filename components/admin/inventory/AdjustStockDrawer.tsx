"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Loader2,
  AlertTriangle,
  Plus,
  Minus,
  Package,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

interface AdjustStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
  currentStock: number;
  thumbnailUrl?: string;
  onSuccess: () => void;
}

export function AdjustStockDrawer({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
  currentStock,
  thumbnailUrl,
  onSuccess,
}: AdjustStockDrawerProps) {
  const { t } = useTranslation();
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const delta = adjustmentType === "increase" ? quantity : -quantity;
  const afterAdjust = currentStock + delta;
  const isValidAdjustment =
    quantity > 0 && reason.trim().length > 0 && afterAdjust >= 0;

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setReason("");
      setAdjustmentType("increase");
      setImageError(false);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleQuantityChange = (delta: number) => {
    const newVal = Math.max(1, (quantity || 0) + delta);
    setQuantity(newVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || quantity <= 0) {
      toast.error(t("admin.inventory.adjust.quantityRequired"));
      return;
    }

    if (!reason.trim()) {
      toast.error(t("admin.inventory.adjust.reasonRequired"));
      return;
    }

    if (afterAdjust < 0) {
      toast.error(t("admin.inventory.adjust.cannotGoNegative"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clientApi.adjustStock({
        variantId,
        quantityDelta: delta,
        reason,
      });

      if (response.error) {
        toast.error(
          response.error.message || t("admin.inventory.adjust.error")
        );
      } else {
        toast.success(t("admin.inventory.adjust.success"));
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(t("admin.inventory.adjust.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[70vw] sm:max-w-[900px] p-0 gap-0 overflow-y-auto bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <SheetHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("admin.inventory.adjust.title")}
              </SheetTitle>
              <SheetDescription className="text-base mt-1 text-slate-600 dark:text-slate-400">
                {t("admin.inventory.adjust.drawerDescription")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Warning Banner */}
        <div className="px-8 py-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {t("admin.inventory.adjust.warning")}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Section - Product Info */}
          <div className="lg:w-2/5 p-8 bg-slate-50 dark:bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
              {t("admin.inventory.adjust.productInfo")}
            </h3>

            {/* Product Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              {/* Product Image */}
              <div className="flex justify-center mb-6">
                {thumbnailUrl && !imageError ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-md">
                    <Image
                      src={thumbnailUrl}
                      alt={productName}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      unoptimized
                    />
                  </div>
                ) : (
                  <ProductImagePlaceholder size="lg" />
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    {t("admin.inventory.adjust.productName")}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {productName || t("admin.inventory.unknownProduct")}
                  </p>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    SKU
                  </p>
                  <code className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {variantSku}
                  </code>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    {t("admin.inventory.adjust.currentTotal")}
                  </p>
                  <p className={cn(
                    "text-3xl font-bold tabular-nums",
                    currentStock <= 0 ? "text-rose-600 dark:text-rose-500" : "text-slate-900 dark:text-slate-100"
                  )}>
                    {currentStock}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Input Form */}
          <div className="lg:w-3/5 p-8 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
              {t("admin.inventory.adjust.inputSection")}
            </h3>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                {/* Adjustment Type Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("admin.inventory.adjust.type")}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-14 gap-3 text-base font-semibold transition-all cursor-pointer rounded-xl",
                        adjustmentType === "increase"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => setAdjustmentType("increase")}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          adjustmentType === "increase"
                            ? "bg-emerald-200 dark:bg-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        <Plus className="h-5 w-5" />
                      </div>
                      {t("admin.inventory.adjust.increase")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-14 gap-3 text-base font-semibold transition-all cursor-pointer rounded-xl",
                        adjustmentType === "decrease"
                          ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400"
                          : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => setAdjustmentType("decrease")}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          adjustmentType === "decrease"
                            ? "bg-rose-200 dark:bg-rose-800"
                            : "bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        <Minus className="h-5 w-5" />
                      </div>
                      {t("admin.inventory.adjust.decrease")}
                    </Button>
                  </div>
                </div>

                {/* Quantity Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("admin.inventory.adjust.quantity")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity || ""}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 0)
                      }
                      className="h-14 text-center text-2xl font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl flex-1 tabular-nums"
                      placeholder="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Reason (Required) */}
                <div className="space-y-3">
                  <Label
                    htmlFor="reason"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("admin.inventory.adjust.reason")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl resize-none min-h-[100px]"
                    placeholder={t("admin.inventory.adjust.reasonPlaceholder")}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {t("admin.inventory.adjust.reasonHint")}
                  </p>
                </div>

                {/* Preview */}
                {quantity > 0 && (
                  <div
                    className={cn(
                      "rounded-xl border p-6",
                      adjustmentType === "increase"
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800"
                        : afterAdjust >= 0
                        ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800"
                        : "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/50 dark:to-red-950/30 border-red-300 dark:border-red-700"
                    )}
                  >
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t("admin.inventory.adjust.before")}
                        </p>
                        <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                          {currentStock}
                        </p>
                      </div>
                      <ArrowRight
                        className={cn(
                          "h-6 w-6",
                          adjustmentType === "increase"
                            ? "text-emerald-500"
                            : "text-rose-500"
                        )}
                      />
                      <div className="text-center">
                        <p
                          className={cn(
                            "text-xs uppercase tracking-wide mb-1",
                            adjustmentType === "increase"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {t("admin.inventory.adjust.after")}
                        </p>
                        <p
                          className={cn(
                            "text-2xl font-bold tabular-nums",
                            afterAdjust < 0
                              ? "text-red-600"
                              : adjustmentType === "increase"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {afterAdjust}
                        </p>
                      </div>
                    </div>

                    {/* Change summary */}
                    <Separator
                      className={cn(
                        "my-4",
                        adjustmentType === "increase"
                          ? "bg-emerald-200 dark:bg-emerald-800"
                          : "bg-rose-200 dark:bg-rose-800"
                      )}
                    />
                    <p
                      className={cn(
                        "text-center text-sm font-semibold",
                        adjustmentType === "increase"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300"
                      )}
                    >
                      {adjustmentType === "increase" ? "+" : "-"}
                      {quantity} {t("admin.inventory.adjust.units")}
                    </p>
                  </div>
                )}

                {/* Error if going negative */}
                {quantity > 0 && afterAdjust < 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                        {t("admin.inventory.adjust.negativeWarningTitle")}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {t("admin.inventory.adjust.cannotGoNegative")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 h-12 rounded-xl text-base font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValidAdjustment}
                    className={cn(
                      "px-8 h-12 rounded-xl text-base font-semibold min-w-[160px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      adjustmentType === "increase"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700",
                      "text-white"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("admin.inventory.adjust.adjusting")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {t("admin.inventory.adjust.submit")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
