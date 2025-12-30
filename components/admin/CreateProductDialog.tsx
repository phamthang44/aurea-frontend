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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientApi } from "@/lib/api-client";
import { CategoryResponse, ApiResult } from "@/lib/types/product";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
}: CreateProductDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    basePrice: undefined as number | undefined,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await clientApi.getCategories();

      if (response.error) {
        toast.error(response.error.message || "Failed to fetch categories");
        setCategories([]);
      } else {
        const result = response.data as ApiResult<CategoryResponse[]>;
        setCategories(result?.data || []);
      }
    } catch {
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = "Category is required";
    }

    if (formData.basePrice === undefined || formData.basePrice === null) {
      newErrors.basePrice = "Base price is required";
    } else if (formData.basePrice <= 0) {
      newErrors.basePrice = "Price must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create draft product with general info only
      const draftProduct = {
        name: formData.name.trim(),
        categoryId: formData.categoryId.trim(),
        description: formData.description.trim(),
        basePrice: formData.basePrice!,
      };

      // Call API to create draft product using /draft endpoint
      const response = await clientApi.createDraftProduct(draftProduct);

      if (response.error) {
        toast.error(response.error.message || "Failed to create product");
        setIsSubmitting(false);
        return;
      }

      // Extract product ID from response
      const responseData = response.data as any;
      const productId = responseData?.data?.id || responseData?.id;

      if (!productId) {
        toast.error("Failed to get product ID from response");
        setIsSubmitting(false);
        return;
      }

      toast.success("Product draft created! Complete the details...");

      // Reset form
      setFormData({
        name: "",
        categoryId: "",
        basePrice: undefined,
        description: "",
      });
      setErrors({});
      onOpenChange(false);

      // Redirect to admin product detail page using ID
      router.push(`/admin/products/${productId}`);
    } catch {
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      setFormData({
        name: "",
        categoryId: "",
        basePrice: undefined,
        description: "",
      });
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-amber-900/30 shadow-2xl dark:shadow-amber-950/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif bg-gradient-to-r from-gray-900 to-gray-700 dark:from-amber-200 dark:to-yellow-100 bg-clip-text text-transparent">
            Create New Product
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-amber-100/60">
            Enter the core product information to create a draft. You&apos;ll be
            able to add media, variants, and more details next.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-gray-700 dark:text-amber-200 font-semibold"
            >
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
              aria-invalid={!!errors.name}
              className={cn(
                errors.name && "border-red-500",
                "bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 text-lg focus:border-amber-500 dark:focus:border-amber-500"
              )}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label
                htmlFor="categoryId"
                className="text-gray-700 dark:text-amber-200 font-semibold"
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                aria-invalid={!!errors.categoryId}
                disabled={isLoadingCategories}
                className={cn(
                  errors.categoryId && "border-red-500",
                  "flex h-10 w-full rounded-md border border-gray-300 dark:border-amber-700/40 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">
                  {isLoadingCategories
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <Label
                htmlFor="basePrice"
                className="text-gray-700 dark:text-amber-200 font-semibold"
              >
                Base Price (VND) <span className="text-red-500">*</span>
              </Label>
              <CurrencyInput
                id="basePrice"
                value={formData.basePrice}
                onChange={(value) =>
                  setFormData({ ...formData, basePrice: value })
                }
                placeholder="1,500,000"
                error={!!errors.basePrice}
                aria-invalid={!!errors.basePrice}
              />
              {errors.basePrice && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.basePrice}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-gray-700 dark:text-amber-200 font-semibold"
            >
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your product, its features, materials, and benefits..."
              rows={6}
              aria-invalid={!!errors.description}
              className={cn(
                errors.description && "border-red-500",
                "bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 resize-none focus:border-amber-500 dark:focus:border-amber-500"
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 font-medium">
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-amber-200/50">
              Provide a detailed description - you can enhance it later with
              rich formatting
            </p>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white font-semibold shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Draft...
                </>
              ) : (
                "Create Draft & Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
