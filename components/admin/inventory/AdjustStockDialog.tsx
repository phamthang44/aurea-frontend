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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  currentStock: number;
  productName: string;
  onSuccess: () => void;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  variantId,
  variantSku,
  currentStock,
  productName,
  onSuccess,
}: AdjustStockDialogProps) {
  const { t } = useTranslation();
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const delta = adjustmentType === "increase" ? quantity : -quantity;
      
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
        onOpenChange(false);
        setQuantity(0);
        setReason("");
        setAdjustmentType("increase");
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
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{t("admin.inventory.adjust.title")}</DialogTitle>
          <DialogDescription>
             {t("admin.inventory.adjust.description", { sku: variantSku, current: currentStock })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-slate-900 dark:text-slate-100">{t("admin.inventory.adjust.type")}</Label>
                <Select
                    value={adjustmentType}
                    onValueChange={(val: "increase" | "decrease") => setAdjustmentType(val)}
                >
                    <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="increase">{t("admin.inventory.adjust.increase")}</SelectItem>
                        <SelectItem value="decrease">{t("admin.inventory.adjust.decrease")}</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-900 dark:text-slate-100">{t("admin.inventory.adjust.quantity")}</Label>
                <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity || ""}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                placeholder="0"
                required
                />
             </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-900 dark:text-slate-100">{t("admin.inventory.adjust.reason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              placeholder={t("admin.inventory.adjust.reasonPlaceholder")}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className={adjustmentType === "increase" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.submitting")}
                </>
              ) : (
                t("admin.inventory.adjust.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
