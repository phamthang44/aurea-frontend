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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

interface ImportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
  onSuccess: () => void;
}

export function ImportStockDialog({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
  onSuccess,
}: ImportStockDialogProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      toast.error(t("admin.inventory.import.quantityRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clientApi.importStock({
        variantId,
        quantity,
        note,
      });

      if (response.error) {
        toast.error(response.error.message || t("admin.inventory.import.error"));
      } else {
        toast.success(t("admin.inventory.import.success"));
        onSuccess();
        onOpenChange(false);
        setQuantity(0);
        setNote("");
      }
    } catch (error) {
        console.error(error);
      toast.error(t("admin.inventory.import.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{t("admin.inventory.import.title")}</DialogTitle>
          <DialogDescription>
            {t("admin.inventory.import.description", { sku: variantSku, product: productName })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-slate-900 dark:text-slate-100">{t("admin.inventory.import.quantity")}</Label>
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
          <div className="space-y-2">
            <Label htmlFor="note" className="text-slate-900 dark:text-slate-100">{t("admin.inventory.import.note")}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              placeholder={t("admin.inventory.import.notePlaceholder")}
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
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.submitting")}
                </>
              ) : (
                t("admin.inventory.import.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
