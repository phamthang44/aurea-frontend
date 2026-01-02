"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ProductAsset } from "@/lib/types/product";

interface MediaTabProps {
  data: {
    assets?: ProductAsset[];
    variants?: any[]; // To populate variant dropdown
  };
  onChange: (updates: any, skipChangeTracking?: boolean) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const [assets, setAssets] = useState<ProductAsset[]>(data.assets || []);

  // Sync local state when props change (after save/refresh)
  useEffect(() => {
    setAssets(data.assets || []);
  }, [data.assets]);

  // Helper to create a new asset from uploaded URL
  const createAssetFromUrl = (
    url: string,
    type: "IMAGE" | "VIDEO" = "IMAGE"
  ): ProductAsset => {
    // Determine if this should be thumbnail (first image if no thumbnail exists)
    const hasThumbnail = assets.some((a) => a.isThumbnail);
    const maxPosition =
      assets.length > 0
        ? Math.max(...assets.map((a) => a.position || 0))
        : -1;

    return {
      url,
      type,
      isThumbnail: !hasThumbnail && type === "IMAGE", // First image becomes thumbnail
      position: maxPosition + 1,
      variantId: null,
    };
  };

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

      // Upload to Cloudinary
      try {
        const formData = new FormData();
        formData.append("file", file);

        toast.loading("Uploading thumbnail...");
        const response = await apiClient.post<{ data: string }>(
          "files",
          formData
        );

        toast.dismiss();

        if (response.error) {
          toast.error("Failed to upload thumbnail");
        } else {
          const cloudinaryUrl = response.data?.data || "";
          toast.success("Thumbnail uploaded");

          // Create asset and set as thumbnail (unset others)
          const newAsset = createAssetFromUrl(cloudinaryUrl, "IMAGE");
          newAsset.isThumbnail = true;

          const updatedAssets = [
            ...assets.map((a) => ({ ...a, isThumbnail: false })), // Unset all other thumbnails
            newAsset,
          ];

          setAssets(updatedAssets);
          onChange({ assets: updatedAssets });
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to upload thumbnail");
        console.error("Thumbnail upload error:", error);
      }
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageAssets = assets.filter((a) => a.type === "IMAGE");
    if (files.length + imageAssets.length > 50) {
      toast.error("Maximum 50 assets allowed");
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

    // Upload multiple files in batch to Cloudinary
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
        toast.success(`${cloudinaryUrls.length} image(s) uploaded`);

        // Create assets from URLs
        const newAssets = cloudinaryUrls.map((url) =>
          createAssetFromUrl(url, "IMAGE")
        );

        const updatedAssets = [...assets, ...newAssets];
        setAssets(updatedAssets);
        onChange({ assets: updatedAssets });
      }
    } catch (error) {
      toast.error("Failed to upload images");
      console.error("Images upload error:", error);
    }
  };

  const removeAsset = (index: number) => {
    const assetToRemove = assets[index];
    const updatedAssets = assets.filter((_, i) => i !== index);

    // If we removed the thumbnail and there are other images, make the first image the thumbnail
    if (assetToRemove.isThumbnail && updatedAssets.length > 0) {
      const firstImage = updatedAssets.find((a) => a.type === "IMAGE");
      if (firstImage) {
        firstImage.isThumbnail = true;
      }
    }

    setAssets(updatedAssets);
    onChange({ assets: updatedAssets });
  };

  const setThumbnail = (index: number) => {
    const updatedAssets = assets.map((asset, i) => ({
      ...asset,
      isThumbnail: i === index,
    }));
    setAssets(updatedAssets);
    onChange({ assets: updatedAssets });
  };

  const updateAssetVariant = (index: number, variantId: string | null) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      variantId: variantId || null,
    };
    setAssets(updatedAssets);
    onChange({ assets: updatedAssets });
  };

  const updateAssetPosition = (index: number, newPosition: number) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      position: newPosition,
    };
    // Sort by position
    updatedAssets.sort((a, b) => (a.position || 0) - (b.position || 0));
    setAssets(updatedAssets);
    onChange({ assets: updatedAssets });
  };

  // Get thumbnail asset
  const thumbnailAsset = assets.find((a) => a.isThumbnail && a.type === "IMAGE");
  // Get general product images (not variant-specific)
  const generalImages = assets.filter(
    (a) => a.type === "IMAGE" && !a.variantId
  );
  // Get variant-specific images
  const variantImages = assets.filter(
    (a) => a.type === "IMAGE" && a.variantId
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Product Media
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload images to showcase your product. Set one as thumbnail and optionally assign to variants.
        </p>
      </div>

      {/* Thumbnail Section */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium text-lg">
          Thumbnail Image <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          This is the main image that will appear in product listings. Select one from your uploaded images or upload a new one.
        </p>

        {thumbnailAsset ? (
          <div className="relative w-full max-w-md h-64 rounded-lg border-2 border-amber-500 border-dashed overflow-hidden bg-secondary/20">
            <img
              src={thumbnailAsset.url}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
              <Star className="h-3 w-3 inline mr-1" />
              THUMBNAIL
            </div>
            <button
              type="button"
              onClick={() => removeAsset(assets.indexOf(thumbnailAsset))}
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

      {/* General Product Images Gallery */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium text-lg">
          Product Images
          <span className="text-xs text-muted-foreground ml-2">
            ({generalImages.length} images)
          </span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Add general marketing images (lifestyle, packaging, etc.) - shared
          across all variants
        </p>

        {/* Image Grid with Controls */}
        {generalImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {generalImages.map((asset, index) => {
              const assetIndex = assets.indexOf(asset);
              return (
                <div
                  key={assetIndex}
                  className="relative aspect-square rounded-lg border-2 border-border overflow-hidden bg-secondary/20 group"
                >
                  <img
                    src={asset.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Thumbnail Badge */}
                  {asset.isThumbnail && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold z-10">
                      <Star className="h-3 w-3 inline mr-1" />
                      THUMBNAIL
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAsset(assetIndex)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-5 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="space-y-2">
                      {/* Thumbnail Radio */}
                      <label className="flex items-center gap-2 text-white text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="thumbnail"
                          checked={asset.isThumbnail}
                          onChange={() => setThumbnail(assetIndex)}
                          className="w-4 h-4 text-amber-500"
                        />
                        <span>Set as thumbnail</span>
                      </label>

                      {/* Variant Assignment */}
                      {data.variants && data.variants.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-white text-xs font-semibold">
                            Assign to variant:
                          </label>
                          <select
                            value={asset.variantId || "none"}
                            onChange={(e) =>
                              updateAssetVariant(
                                assetIndex,
                                e.target.value === "none" ? null : e.target.value
                              )
                            }
                            className="h-8 w-full text-xs bg-white/10 border border-white/20 rounded text-white px-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                          >
                            <option value="none" className="bg-slate-800 text-white">
                              General product
                            </option>
                            {data.variants.map((variant) => (
                              <option
                                key={variant.id || variant.sku}
                                value={variant.id || variant.sku}
                                className="bg-slate-800 text-white"
                              >
                                {variant.attributes?.color || "N/A"} -{" "}
                                {variant.attributes?.size || "N/A"} (
                                {variant.sku || "No SKU"})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Position */}
                      <div className="space-y-1">
                        <label className="text-white text-xs font-semibold">
                          Position:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={asset.position || 0}
                          onChange={(e) =>
                            updateAssetPosition(
                              assetIndex,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full h-7 px-2 text-xs bg-white/10 border border-white/20 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-700/80 dark:bg-slate-800/80 text-white text-xs py-1.5 px-2 text-center">
                    Image {index + 1} {asset.isThumbnail && "⭐"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Button */}
        {generalImages.length < 50 && (
          <label
            htmlFor="images-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all bg-background"
          >
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-foreground font-medium">
                {generalImages.length === 0
                  ? "Upload product images"
                  : "Add more images"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {generalImages.length}/50 uploaded
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
      {variantImages.length > 0 && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium text-lg">
            Variant-Specific Images
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({variantImages.length} images)
            </span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Images assigned to specific variants
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {variantImages.map((asset, index) => {
              const assetIndex = assets.indexOf(asset);
              const variant = data.variants?.find(
                (v) => v.id === asset.variantId || v.sku === asset.variantId
              );
              return (
                <div
                  key={assetIndex}
                  className="relative aspect-square rounded-lg border-2 border-blue-500/50 overflow-hidden bg-secondary/20 group"
                >
                  <img
                    src={asset.url}
                    alt={`Variant image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Top badge - Variant Info */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    VARIANT
                  </div>
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAsset(assetIndex)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {/* Bottom info - Variant Details */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-blue-600/95 to-transparent pt-8 pb-2 px-2">
                    <div className="text-white">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {variant?.attributes?.color && (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{
                              backgroundColor:
                                variant.attributes.color.toLowerCase() || "#888",
                            }}
                          />
                        )}
                        {variant?.attributes?.color || "N/A"}
                      </div>
                      <div className="text-xs text-blue-100 mt-1">
                        Size: {variant?.attributes?.size || "N/A"} | SKU:{" "}
                        {variant?.sku || asset.variantId || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}



