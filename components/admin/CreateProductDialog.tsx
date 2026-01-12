"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { CategoryResponse, ApiResult } from "@/lib/types/product";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { FormField } from "./FormField";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
}: CreateProductDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    defaultValues: {
      name: "",
      categoryId: "",
      basePrice: undefined as number | undefined,
      description: "",
    },
  });

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    } else {
      reset(); // Reset form when closing
    }
  }, [open, reset]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await clientApi.getCategories();

      if (response.error) {
        toast.error(response.error.message || t("admin.products.fetchCategoriesError"));
        setCategories([]);
      } else {
        const result = response.data as ApiResult<CategoryResponse[]>;
        setCategories(result?.data || []);
      }
    } catch {
      toast.error(t("admin.products.fetchCategoriesError"));
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Create draft product with general info only
      const draftProduct = {
        name: data.name.trim(),
        categoryId: data.categoryId,
        description: data.description.trim(),
        basePrice: data.basePrice,
      };

      const response = await clientApi.createDraftProduct(draftProduct);

      if (response.error) {
        // Map backend errors if they exist in a structured way
        if ((response.error as any).details) {
          const details = (response.error as any).details;
          Object.keys(details).forEach((key) => {
            setError(key as any, { type: "manual", message: details[key] });
          });
        }
        
        toast.error(response.error.message || t("admin.products.saveProductError"));
        setIsSubmitting(false);
        return;
      }

      const responseData = response.data as any;
      const productId = responseData?.data?.id || responseData?.id;

      if (!productId) {
        toast.error(t("admin.productDetail.createDialog.errorProductId"));
        setIsSubmitting(false);
        return;
      }

      toast.success(t("admin.productDetail.createDialog.success"));
      onOpenChange(false);
      router.push(`/admin/products/${productId}`);
    } catch (error) {
      toast.error(t("admin.products.unexpectedError"));
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-amber-900/30 shadow-2xl dark:shadow-amber-950/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif bg-gradient-to-r from-gray-900 to-gray-700 dark:from-amber-200 dark:to-yellow-100 bg-clip-text text-transparent">
            {t("admin.productDetail.createDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-amber-100/60">
            {t("admin.productDetail.createDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name */}
          <FormField
            label={t("admin.productDetail.createDialog.productName")}
            required
            error={errors.name?.message as string}
          >
            <Input
              {...register("name", {
                required: t("admin.productDetail.createDialog.validation.nameRequired"),
                minLength: {
                  value: 3,
                  message: t("admin.productDetail.createDialog.validation.nameTooShort"),
                },
                maxLength: {
                  value: 255,
                  message: t("admin.productDetail.createDialog.validation.nameTooLong"),
                },
              })}
              placeholder={t("admin.productDetail.createDialog.productNamePlaceholder")}
              aria-invalid={!!errors.name}
              className={cn(
                errors.name && "border-rose-500 focus-visible:ring-rose-500/20",
                "bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 text-lg focus:border-amber-500 dark:focus:border-amber-500"
              )}
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <FormField
              label={t("admin.productDetail.createDialog.category")}
              required
              error={errors.categoryId?.message as string}
            >
              <select
                {...register("categoryId", {
                  required: t("admin.productDetail.createDialog.validation.categoryRequired"),
                })}
                aria-invalid={!!errors.categoryId}
                disabled={isLoadingCategories}
                className={cn(
                  errors.categoryId && "border-rose-500 focus:ring-rose-500/20",
                  "flex h-10 w-full rounded-md border border-gray-300 dark:border-amber-700/40 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">
                  {isLoadingCategories
                    ? t("admin.productDetail.createDialog.loadingCategories")
                    : t("admin.productDetail.createDialog.selectCategory")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Base Price */}
            <FormField
              label={t("admin.productDetail.createDialog.basePrice")}
              required
              error={errors.basePrice?.message as string}
            >
              <Controller
                name="basePrice"
                control={control}
                rules={{
                  required: t("admin.productDetail.createDialog.validation.priceRequired"),
                  min: {
                    value: 1000,
                    message: t("admin.productDetail.createDialog.validation.pricePositive"),
                  },
                }}
                render={({ field: { onChange, value, onBlur, name } }) => (
                  <CurrencyInput
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={t("admin.productDetail.createDialog.basePricePlaceholder")}
                    error={!!errors.basePrice}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label={t("admin.productDetail.createDialog.descriptionLabel")}
            required
            error={errors.description?.message as string}
            hint={t("admin.productDetail.createDialog.descriptionHint")}
          >
            <Textarea
              {...register("description", {
                required: t("admin.productDetail.createDialog.validation.descriptionRequired"),
                minLength: {
                  value: 20,
                  message: t("admin.productDetail.createDialog.validation.descriptionTooShort"),
                },
              })}
              placeholder={t("admin.productDetail.createDialog.descriptionPlaceholder")}
              rows={6}
              aria-invalid={!!errors.description}
              className={cn(
                errors.description && "border-rose-500 focus-visible:ring-rose-500/20",
                "bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 resize-none focus:border-amber-500 dark:focus:border-amber-500"
              )}
            />
          </FormField>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white font-semibold shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.productDetail.createDialog.submitting")}
                </>
              ) : (
                t("admin.productDetail.createDialog.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
