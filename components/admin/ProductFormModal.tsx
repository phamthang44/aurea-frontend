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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: undefined as number | undefined,
    categoryId: "",
    thumbnail: "",
    images: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        basePrice: product.basePrice,
        categoryId: product.categoryId || "",
        thumbnail: product.thumbnail || "",
        images: product.images?.join(", ") || "",
      });
      setThumbnailPreview(product.thumbnail || "");
      setImagePreviews(product.images || []);
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: undefined,
        categoryId: "",
        thumbnail: "",
        images: "",
      });
      setThumbnailPreview("");
      setImagePreviews([]);
    }
    setErrors({});
    setThumbnailFile(null);
    setImageFiles([]);
  }, [product, open]);

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
      setThumbnailFile(file);
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
    setThumbnailFile(null);
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

    if (formData.basePrice === undefined || formData.basePrice === null) {
      newErrors.basePrice = "Base price is required";
    } else if (formData.basePrice <= 0) {
      newErrors.basePrice = "Price must be greater than 0";
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
      basePrice: formData.basePrice!,
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
              <Label htmlFor="basePrice" className="text-foreground font-medium">
                Base Price (VND) <span className="text-red-500">*</span>
              </Label>
              <CurrencyInput
                id="basePrice"
                value={formData.basePrice}
                onChange={(value) =>
                  setFormData({ ...formData, basePrice: value })
                }
                placeholder="150,000"
                error={!!errors.basePrice}
                aria-invalid={!!errors.basePrice}
              />
              {errors.basePrice && (
                <p className="text-sm text-red-500 font-medium">{errors.basePrice}</p>
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
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
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
                      <img
                        src={preview}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
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

