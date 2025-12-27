"use client";

import { useEffect, useState } from "react";
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
import { ProductResponse, CreateProductRequest, UpdateProductRequest } from "@/lib/types/product";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    categoryId: "",
    thumbnail: "",
    images: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        basePrice: product.basePrice?.toString() || "",
        categoryId: product.categoryId || "",
        thumbnail: product.thumbnail || "",
        images: product.images?.join(", ") || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        categoryId: "",
        thumbnail: "",
        images: "",
      });
    }
    setErrors({});
  }, [product, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.basePrice.trim()) {
      newErrors.basePrice = "Base price is required";
    } else {
      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price <= 0) {
        newErrors.basePrice = "Price must be greater than 0";
      }
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const images = formData.images
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      basePrice: parseFloat(formData.basePrice),
      categoryId: formData.categoryId.trim(),
      thumbnail: formData.thumbnail.trim() || undefined,
      images: images.length > 0 ? images : undefined,
      // For now, we'll require at least one variant for create
      variants: product ? undefined : [
        {
          quantity: 1,
          attributes: { color: "Default", size: "Default" },
        },
      ],
    };

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {product
              ? "Update the product information below."
              : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
              className={cn(
                "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                errors.name ? "border-red-500" : ""
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-600 font-medium">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description"
              rows={4}
              className={cn(
                "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                errors.description ? "border-red-500" : ""
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-600 font-medium">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-gray-900">
                Base Price (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                placeholder="150000"
                className={cn(
                  "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                  errors.basePrice ? "border-red-500" : ""
                )}
              />
              {errors.basePrice && (
                <p className="text-sm text-red-600 font-medium">{errors.basePrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-900">
                Category ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                placeholder="Enter category ID"
                className={cn(
                  "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                  errors.categoryId ? "border-red-500" : ""
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-600 font-medium">{errors.categoryId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-gray-900">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-gray-900">Image URLs (comma-separated)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value })
              }
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              rows={3}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

