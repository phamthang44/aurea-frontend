"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MediaTabProps {
  data: {
    thumbnail?: string;
    images?: string[];
  };
  onChange: (updates: any) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState(data.thumbnail || "");
  const [imagePreviews, setImagePreviews] = useState<string[]>(data.images || []);

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

      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setThumbnailPreview(url);
        onChange({ thumbnail: url });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setImagePreviews((prev) => {
          const updated = [...prev, url];
          onChange({ images: updated });
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
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

      {/* Product Images Gallery */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium text-lg">
          Product Images
          <span className="text-xs text-muted-foreground ml-2">(Max 10 images)</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Add multiple images to show different angles and details
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
                {imagePreviews.length === 0 ? "Upload product images" : "Add more images"}
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
    </div>
  );
}

