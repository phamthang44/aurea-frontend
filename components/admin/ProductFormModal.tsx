"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
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
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ProductResponse, CreateProductRequest, UpdateProductRequest } from "@/lib/types/product";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";


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
  // Derive initial form values from product prop
  const initialFormData = useMemo(() => {
    if (product) {
      const thumbnailAsset = product.assets?.find((a) => a.isThumbnail);
      const imageUrls = product.assets?.map((a) => a.url) || product.images || [];
      return {
        name: product.name || "",
        description: product.description || "",
        minPrice: product.minPrice,
        originalPrice: product.originalPrice,
        costPrice: product.costPrice,
        categoryId: product.categoryId || "",
        thumbnail: thumbnailAsset?.url || product.thumbnail || "",
        images: imageUrls.join(", "),
      };
    }
    return {
      name: "",
      description: "",
      minPrice: undefined as number | undefined,
      originalPrice: undefined as number | undefined,
      costPrice: undefined as number | undefined,
      categoryId: "",
      thumbnail: "",
      images: "",
    };
  }, [product]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Mock categories - replace with actual API call
  const categories = [
    { id: "792254090050729589", name: "Áo Thun (T-Shirt)" },
    { id: "792254090050729590", name: "Áo Sơ Mi (Shirt)" },
    { id: "792254090050729591", name: "Giày (Shoes)" },
    { id: "792254090050729592", name: "Sneaker" },
  ];

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (!open) return;
    
    // Reset form to initial values
    setFormData(initialFormData);
    
    if (product) {
      const thumbnailAsset = product.assets?.find((a) => a.isThumbnail);
      const imageUrls = product.assets?.map((a) => a.url) || product.images || [];
      setThumbnailPreview(thumbnailAsset?.url || product.thumbnail || "");
      setImagePreviews(imageUrls);
    } else {
      setThumbnailPreview("");
      setImagePreviews([]);
    }
    setErrors({});
    setSelectedThumbnailFile(null);
    setImageFiles([]);
  }, [product, open, initialFormData]);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setSelectedThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    const newFiles = [...imageFiles, ...validFiles];
    setImageFiles(newFiles);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeThumbnail = () => {
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
    setFormData({ ...formData, thumbnail: "" });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.minPrice === undefined || formData.minPrice === null) {
      newErrors.minPrice = "Min price is required";
    } else if (formData.minPrice <= 0) {
      newErrors.minPrice = "Price must be greater than 0";
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

    // Convert to assets format
    const assets = images.map((url, index) => ({
      url,
      type: "IMAGE" as const,
      isThumbnail: index === 0 && !formData.thumbnail, // First image is thumbnail if no explicit thumbnail
      position: index,
      variantId: null,
    }));

    // Add thumbnail as separate asset if provided
    if (formData.thumbnail.trim()) {
      assets.unshift({
        url: formData.thumbnail.trim(),
        type: "IMAGE" as const,
        isThumbnail: true,
        position: 0,
        variantId: null,
      });
      // Update other assets' positions
      assets.slice(1).forEach((asset, idx) => {
        asset.position = idx + 1;
        asset.isThumbnail = false;
      });
    }

    const generatedSlug =
      product?.slug ||
      formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const baseData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      minPrice: formData.minPrice!,
      originalPrice: formData.originalPrice!,
      costPrice: formData.costPrice!,
      categoryId: formData.categoryId.trim(),
      slug: generatedSlug,
      assets: assets.length > 0 ? assets : undefined,
      // For now, we'll require at least one variant for create
      variants: product
        ? undefined
        : [
            {
              quantity: 0,
              sellingPrice: formData.minPrice || 0,
              originalPrice: formData.originalPrice || 0,
              costPrice: formData.costPrice || 0,
              attributes: { color: "Default", size: "Default" },
            },
          ],
    };

    const submitData: CreateProductRequest | UpdateProductRequest = product
      ? ({
          ...baseData,
          isActive: product.isActive,
        } as UpdateProductRequest)
      : (baseData as CreateProductRequest);

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-1 border-[var(--color-muted-foreground)] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {product
              ? "Update the product information below."
              : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description"
              rows={4}
              aria-invalid={!!errors.description}
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && (
              <p className="text-sm text-destructive font-medium">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-foreground font-medium">
                Min Price (VND) <span className="text-red-500">*</span>
              </Label>
              <CurrencyInput
                id="minPrice"
                value={formData.minPrice}
                onChange={(value) =>
                  setFormData({ ...formData, minPrice: value })
                }
                placeholder="150,000"
                error={!!errors.minPrice}
                aria-invalid={!!errors.minPrice}
              />
              {errors.minPrice && (
                <p className="text-sm text-red-500 font-medium">{errors.minPrice}</p>
              )}
            </div>

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
                <p className="text-sm text-red-500 font-medium">{errors.categoryId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">Thumbnail Image</Label>
            <div className="space-y-3">
              {thumbnailPreview ? (
                <div className="relative w-full h-48 rounded-lg border-2 border-border overflow-hidden bg-secondary/20">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    unoptimized={thumbnailPreview.startsWith('data:')}
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-background"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Product Images <span className="text-xs text-muted-foreground">(Max 10 images)</span>
            </Label>
            <div className="space-y-3">
              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg border border-border overflow-hidden bg-secondary/20 group"
                    >
                      <Image
                        src={preview}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={preview.startsWith('data:')}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-700/80 dark:bg-slate-800/80 text-white text-xs py-1 px-2 text-center">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {imagePreviews.length < 10 && (
                <label
                  htmlFor="images-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-background"
                >
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      {imagePreviews.length === 0 ? "Upload product images" : "Add more images"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {imagePreviews.length}/10 uploaded
                    </p>
                  </div>
                  <input
                    id="images-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImagesUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-2 border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

