"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface MediaTabProps {
  data: {
    thumbnail?: string;
    images?: string[];
    variants?: any[]; // To display variant-specific images
  };
  onChange: (updates: any) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState(
    data.thumbnail || ""
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    data.images || []
  );

  // Sync local state when props change (after save/refresh)
  useEffect(() => {
    setThumbnailPreview(data.thumbnail || "");
    setImagePreviews(data.images || []);
  }, [data.thumbnail, data.images]);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      // Show preview immediately (base64 for instant feedback)
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary (temporary - will be confirmed on Save)
      try {
        const formData = new FormData();
        formData.append("file", file);

        toast.loading("Uploading thumbnail...");
        const response = await apiClient.post<{ data: string }>("files", formData);

        toast.dismiss();

        if (response.error) {
          toast.error("Failed to upload thumbnail");
          setThumbnailPreview("");
        } else {
          const cloudinaryUrl = response.data?.data || "";
          toast.success("Thumbnail uploaded (will be saved on Save Changes)");
          setThumbnailPreview(cloudinaryUrl);
          onChange({ thumbnail: cloudinaryUrl });
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to upload thumbnail");
        setThumbnailPreview("");
        console.error("Thumbnail upload error:", error);
      }
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
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

    if (validFiles.length === 0) return;

    // Upload multiple files in batch to Cloudinary (temporary - confirmed on Save)
    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      const toastId = toast.loading(
        `Uploading ${validFiles.length} image(s)...`
      );
      const response = await apiClient.post<{ data: string[] }>(
        "files/upload-multiple",
        formData
      );

      toast.dismiss(toastId);

      if (response.error) {
        toast.error("Failed to upload images");
        console.error("Upload error:", response.error);
      } else {
        const cloudinaryUrls = response.data?.data || [];
        toast.success(
          `${cloudinaryUrls.length} image(s) uploaded (will be saved on Save Changes)`
        );

        setImagePreviews((prev) => {
          const updated = [...prev, ...cloudinaryUrls];
          onChange({ images: updated });
          return updated;
        });
      }
    } catch (error) {
      toast.error("Failed to upload images");
      console.error("Images upload error:", error);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onChange({ images: updated });
      return updated;
    });
  };

  const removeThumbnail = () => {
    setThumbnailPreview("");
    onChange({ thumbnail: "" });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Product Media
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload images to showcase your product
        </p>
      </div>

      {/* Thumbnail */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium text-lg">
          Thumbnail Image <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          This is the main image that will appear in product listings
        </p>

        {thumbnailPreview ? (
          <div className="relative w-full max-w-md h-64 rounded-lg border border-border overflow-hidden bg-secondary/20">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeThumbnail}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="thumbnail-upload"
            className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-background"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="mb-2 text-sm text-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP (MAX. 5MB)
              </p>
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

      {/* Product Images Gallery */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium text-lg">
          General Product Images
          <span className="text-xs text-muted-foreground ml-2">
            (Max 10 images)
          </span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Add general marketing images (lifestyle, packaging, etc.) - shared
          across all variants
        </p>

        {/* Image Grid */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-slate-700/80 dark:bg-slate-800/80 text-white text-xs py-1.5 px-2 text-center">
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
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-background"
          >
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-foreground font-medium">
                {imagePreviews.length === 0
                  ? "Upload product images"
                  : "Add more images"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
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

      {/* Variant-Specific Images Display */}
      {data.variants && data.variants.some((v: any) => v.imageUrl) && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium text-lg">
            Variant-Specific Images
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({data.variants.filter((v: any) => v.imageUrl).length} images)
            </span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Images uploaded in Variants tab - linked to specific color/size
            combinations
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.variants
              .filter((v: any) => v.imageUrl)
              .map((variant: any, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border-2 border-blue-500/50 overflow-hidden bg-secondary/20 group"
                >
                  <img
                    src={variant.imageUrl}
                    alt={`${variant.attributes?.color || ""} ${
                      variant.attributes?.size || ""
                    }`}
                    className="w-full h-full object-cover"
                  />
                  {/* Top badge - Image Type */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    VARIANT
                  </div>
                  {/* Bottom info - Color & Size */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-blue-600/95 to-transparent pt-8 pb-2 px-2">
                    <div className="text-white">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{
                            backgroundColor:
                              variant.attributes?.color?.toLowerCase() ||
                              "#888",
                          }}
                        />
                        {variant.attributes?.color || "N/A"}
                      </div>
                      <div className="text-xs text-blue-100 mt-1">
                        Size: {variant.attributes?.size || "N/A"} | SKU:{" "}
                        {variant.sku || "N/A"}
                      </div>
                    </div>
                  </div>
                  {/* Hover overlay with metadata */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center text-white text-xs space-y-1">
                    <div>
                      <strong>Type:</strong> VARIANT
                    </div>
                    <div>
                      <strong>Linked to:</strong> Color
                    </div>
                    <div>
                      <strong>Color:</strong>{" "}
                      {variant.attributes?.color || "N/A"}
                    </div>
                    <div>
                      <strong>Size:</strong> {variant.attributes?.size || "N/A"}
                    </div>
                    <div>
                      <strong>SKU:</strong> {variant.sku || "N/A"}
                    </div>
                    <div className="text-blue-300 mt-2">
                      ℹ️ Hover to see details
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <p className="text-xs text-muted-foreground italic">
            💡 Tip: Upload variant images in the Variants tab to link them to
            specific color/size combinations
          </p>
        </div>
      )}
    </div>
  );
}
