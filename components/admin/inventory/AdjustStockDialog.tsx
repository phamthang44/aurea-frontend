"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Loader2, AlertTriangle, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  currentStock: number;
  onSuccess: () => void;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  variantId,
  variantSku,
  currentStock,
  onSuccess,
}: AdjustStockDialogProps) {
  const { t } = useTranslation();
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const delta = adjustmentType === "increase" ? quantity : -quantity;
  const afterAdjust = currentStock + delta;
  const isValidAdjustment = quantity > 0 && reason.trim().length > 0 && afterAdjust >= 0;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setQuantity(0);
      setReason("");
      setAdjustmentType("increase");
    }, 200);
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
        toast.error(response.error.message || t("admin.inventory.adjust.error"));
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t("admin.inventory.adjust.title")}
              </DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                SKU: <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{variantSku}</code>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Warning Banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            {t("admin.inventory.adjust.warning")}
          </p>
        </div>

        {/* Current Stock Display */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {t("admin.inventory.adjust.currentTotal")}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {currentStock}
          </p>
        </div>

        <Separator />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Adjustment Type Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("admin.inventory.adjust.type")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-11 gap-2 transition-all",
                  adjustmentType === "increase" 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400" 
                    : "text-slate-600 hover:text-slate-700"
                )}
                onClick={() => setAdjustmentType("increase")}
              >
                <Plus className="h-4 w-4" />
                {t("admin.inventory.adjust.increase")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-11 gap-2 transition-all",
                  adjustmentType === "decrease" 
                    ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400" 
                    : "text-slate-600 hover:text-slate-700"
                )}
                onClick={() => setAdjustmentType("decrease")}
              >
                <Minus className="h-4 w-4" />
                {t("admin.inventory.adjust.decrease")}
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("admin.inventory.adjust.quantity")}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="h-11 text-lg font-semibold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              placeholder="0"
            />
          </div>

          {/* Reason (Required) */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("admin.inventory.adjust.reason")} <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
              placeholder={t("admin.inventory.adjust.reasonPlaceholder")}
              rows={2}
              required
            />
          </div>

          {/* Preview */}
          {quantity > 0 && (
            <div className={cn(
              "flex items-center justify-center gap-3 py-3 px-4 rounded-lg border",
              adjustmentType === "increase"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : afterAdjust >= 0
                  ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
                  : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
            )}>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("admin.inventory.adjust.before")}</p>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400 tabular-nums">{currentStock}</p>
              </div>
              <ArrowRight className={cn(
                "h-4 w-4",
                adjustmentType === "increase" ? "text-emerald-600" : "text-rose-600"
              )} />
              <div className="text-center">
                <p className={cn(
                  "text-xs",
                  adjustmentType === "increase" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-rose-600 dark:text-rose-400"
                )}>
                  {t("admin.inventory.adjust.after")}
                </p>
                <p className={cn(
                  "text-lg font-bold tabular-nums",
                  afterAdjust < 0 
                    ? "text-red-600" 
                    : adjustmentType === "increase" 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-rose-600 dark:text-rose-400"
                )}>
                  {afterAdjust}
                </p>
              </div>
            </div>
          )}

          {/* Error if going negative */}
          {quantity > 0 && afterAdjust < 0 && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t("admin.inventory.adjust.cannotGoNegative")}
            </p>
          )}
        </form>

        <Separator />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-600"
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValidAdjustment} 
            className={cn(
              "min-w-[120px]",
              adjustmentType === "increase" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "bg-rose-600 hover:bg-rose-700",
              "text-white"
            )}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("admin.inventory.adjust.adjusting")}
              </>
            ) : (
              t("admin.inventory.adjust.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
