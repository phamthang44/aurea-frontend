"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  ArrowRight,
  Loader2,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { cn } from "@/lib/utils";

interface ImportStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
  currentStock: number;
  thumbnailUrl?: string;
  currentCostPrice?: number;
  onSuccess: () => void;
}

// Helper to format currency for display
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
};

export function ImportStockDrawer({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
  currentStock,
  thumbnailUrl,
  currentCostPrice = 0,
  onSuccess,
}: ImportStockDrawerProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(1);
  const [importPrice, setImportPrice] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate values
  const afterImport = currentStock + (quantity || 0);
  const totalValue = useMemo(() => {
    if (!quantity || !importPrice) return 0;
    return quantity * importPrice;
  }, [quantity, importPrice]);

  // Check for price discrepancy (>50% difference)
  const priceDiscrepancy = useMemo(() => {
    if (!importPrice || !currentCostPrice || currentCostPrice === 0)
      return null;
    const percentageDiff = Math.abs(
      ((importPrice - currentCostPrice) / currentCostPrice) * 100
    );
    return percentageDiff > 50 ? percentageDiff : null;
  }, [importPrice, currentCostPrice]);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setImportPrice(currentCostPrice || undefined);
      setNote("");
      setImageError(false);
    }
  }, [open, currentCostPrice]);

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
      toast.error(t("admin.inventory.import.quantityRequired"));
      return;
    }

    if (!importPrice || importPrice <= 0) {
      toast.error(t("admin.inventory.import.importPriceRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clientApi.importStock({
        variantId,
        quantity,
        importPrice,
        note,
      });

      if (response.error) {
        toast.error(
          response.error.message || t("admin.inventory.import.error")
        );
      } else {
        toast.success(t("admin.inventory.import.success"));
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(t("admin.inventory.import.unexpectedError"));
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
        <SheetHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shadow-sm">
              <Package className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("admin.inventory.import.title")}
              </SheetTitle>
              <SheetDescription className="text-base mt-1 text-slate-600 dark:text-slate-400">
                {t("admin.inventory.import.drawerDescription")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Section - Product Info */}
          <div className="lg:w-2/5 p-8 bg-slate-50 dark:bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
              {t("admin.inventory.import.productInfo")}
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
                    {t("admin.inventory.import.productName")}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                      {t("admin.inventory.import.currentStock")}
                    </p>
                    <p className={cn(
                      "text-3xl font-bold tabular-nums",
                      currentStock <= 0 ? "text-rose-600 dark:text-rose-500" : "text-slate-900 dark:text-slate-100"
                    )}>
                      {currentStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                      {t("admin.inventory.import.currentCostPrice")}
                    </p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {currentCostPrice
                        ? `${formatCurrency(currentCostPrice)} ₫`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Input Form */}
          <div className="lg:w-3/5 p-8 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
              {t("admin.inventory.import.inputSection")}
            </h3>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                {/* Quantity Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("admin.inventory.import.quantity")}{" "}
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

                {/* Import Price Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="importPrice"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("admin.inventory.import.importPrice")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <CurrencyInput
                      value={importPrice}
                      onChange={(value) => setImportPrice(value)}
                      className="h-14 text-xl font-bold pl-4 pr-14 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl tabular-nums"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                      ₫
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {t("admin.inventory.import.importPriceHint")}
                  </p>

                  {/* Price Discrepancy Warning */}
                  {priceDiscrepancy && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          {t("admin.inventory.import.priceWarningTitle")}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                          {t("admin.inventory.import.priceWarningMessage", {
                            percentage: priceDiscrepancy.toFixed(0),
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Note Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="note"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("admin.inventory.import.note")}
                  </Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl resize-none min-h-[80px]"
                    placeholder={t("admin.inventory.import.notePlaceholder")}
                    rows={3}
                  />
                </div>

                {/* Real-time Calculation Preview */}
                {quantity > 0 && importPrice && importPrice > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
                    {/* Stock Change Preview */}
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          {t("admin.inventory.import.before")}
                        </p>
                        <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                          {currentStock}
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-emerald-500" />
                      <div className="text-center">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                          {t("admin.inventory.import.after")}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {afterImport}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-emerald-200 dark:bg-emerald-800 mb-4" />

                    {/* Total Value Calculation */}
                    <div className="text-center">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
                        {t("admin.inventory.import.totalImportValue")}
                      </p>
                      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                        {formatCurrency(totalValue)} ₫
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center justify-center gap-1">
                        <span className="font-semibold">{quantity}</span>
                        <span>×</span>
                        <span className="font-semibold">
                          {formatCurrency(importPrice)} ₫
                        </span>
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
                    disabled={
                      isSubmitting || quantity <= 0 || !importPrice || importPrice <= 0
                    }
                    className="px-8 h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("admin.inventory.import.adding")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {t("admin.inventory.import.submit")}
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
