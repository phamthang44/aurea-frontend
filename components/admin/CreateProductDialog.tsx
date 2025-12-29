"use client";

import { useState } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    basePrice: undefined as number | undefined,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock categories - replace with actual API call
  const categories = [
    { id: "792254090050729589", name: "Áo Thun (T-Shirt)" },
    { id: "792254090050729590", name: "Áo Sơ Mi (Shirt)" },
    { id: "792254090050729591", name: "Giày (Shoes)" },
    { id: "792254090050729592", name: "Sneaker" },
  ];

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
      // Create draft product with core information
      const draftProduct = {
        name: formData.name.trim(),
        categoryId: formData.categoryId.trim(),
        description: formData.description.trim(),
        basePrice: formData.basePrice!,
        // Add default variant for now
        variants: [
          {
            quantity: 0,
            attributes: { color: "Default", size: "Default" },
          },
        ],
      };

      // Call API to create draft product
      const response = await clientApi.createProduct(draftProduct);

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

      // Redirect to full edit page
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            Create New Product
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the core product information to create a draft. You&apos;ll be able to add media, variants, and more details next.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
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
                "bg-background text-foreground border-border text-lg"
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
              <Label htmlFor="categoryId" className="text-foreground font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                aria-invalid={!!errors.categoryId}
                className={cn(
                  errors.categoryId && "border-red-500",
                  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">Select a category</option>
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
              <Label htmlFor="basePrice" className="text-foreground font-medium">
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
            <Label htmlFor="description" className="text-foreground font-medium">
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
                "bg-background text-foreground border-border resize-none"
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 font-medium">
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Provide a detailed description - you can enhance it later with rich formatting
            </p>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border-2 border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
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

