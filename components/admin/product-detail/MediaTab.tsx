"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Upload, X, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { ProductAsset } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Variant {
  id?: string;
  sku?: string;
  attributes?: Record<string, string>;
}

interface MediaTabProps {
  data: {
    assets?: ProductAsset[];
    variants?: Variant[];
  };
  onChange: (updates: { assets?: ProductAsset[] }, skipChangeTracking?: boolean) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const { t } = useTranslation();
  
  // Use useMemo to derive assets from props to avoid unnecessary re-renders
  const initialAssets = useMemo(() => data.assets || [], [data.assets]);
  const [assets, setAssets] = useState<ProductAsset[]>(initialAssets);
  
  // Sync state when data.assets changes (from external updates)
  useMemo(() => {
    if (JSON.stringify(data.assets) !== JSON.stringify(assets)) {
      setAssets(data.assets || []);
    }
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
        toast.error(t("admin.productDetail.messages.fileTooLarge"));
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(t("admin.productDetail.messages.invalidFileType"));
        return;
      }

      // Upload to Cloudinary
      try {
        const formData = new FormData();
        formData.append("file", file);

        toast.loading(t("admin.productDetail.messages.uploadingThumbnail"));
        const response = await apiClient.post<{ data: string }>(
          "files",
          formData
        );

        toast.dismiss();

        if (response.error) {
          toast.error(t("admin.productDetail.messages.uploadThumbnailFail"));
        } else {
          const cloudinaryUrl = response.data?.data || "";
          toast.success(t("admin.productDetail.messages.uploadThumbnailSuccess"));

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
        toast.error(t("admin.productDetail.messages.uploadThumbnailFail"));
        console.error("Thumbnail upload error:", error);
      }
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageAssets = assets.filter((a) => a.type === "IMAGE");
    if (files.length + imageAssets.length > 50) {
      toast.error(t("admin.productDetail.messages.maxAssetsReached"));
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("admin.productDetail.messages.fileTooLargeSpecific", { fileName: file.name }));
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(t("admin.productDetail.messages.invalidFileSpecific", { fileName: file.name }));
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
        t("admin.productDetail.messages.uploadingImages", { count: validFiles.length })
      );
      const response = await apiClient.post<{ data: string[] }>(
        "files/upload-multiple",
        formData
      );

      toast.dismiss(toastId);

      if (response.error) {
        toast.error(t("admin.productDetail.messages.uploadImagesFail"));
        console.error("Upload error:", response.error);
      } else {
        const cloudinaryUrls = response.data?.data || [];
        toast.success(t("admin.productDetail.messages.uploadImagesSuccess", { count: cloudinaryUrls.length }));

        // Create assets from URLs
        const newAssets = cloudinaryUrls.map((url) =>
          createAssetFromUrl(url, "IMAGE")
        );

        const updatedAssets = [...assets, ...newAssets];
        setAssets(updatedAssets);
        onChange({ assets: updatedAssets });
      }
    } catch (error) {
      toast.error(t("admin.productDetail.messages.uploadImagesFail"));
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 italic">{t("admin.productDetail.visualAssets")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.productDetail.mediaSubtitle")}</p>
        </div>

        {/* Primary Thumbnail Section */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2">
                {t("admin.productDetail.media.primaryListingImage")}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("admin.productDetail.media.primaryListingDesc")}
              </p>
            </div>

            <div className="flex-1">
              {thumbnailAsset ? (
                <div className="group relative aspect-[4/3] max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-slate-700 bg-white dark:bg-slate-950">
                  <Image
                    src={thumbnailAsset.url}
                    alt="Primary product"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                    <Star className="h-3 w-3 fill-white" />
                    {t("admin.productDetail.primaryAsset")}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                       const idx = assets.findIndex(a => a.isThumbnail);
                       if (idx !== -1) removeAsset(idx);
                    }}
                    className="absolute top-4 right-4 h-10 w-10 bg-white/90 dark:bg-slate-900/90 text-rose-500 rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-rose-500 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col items-center justify-center aspect-[4/3] max-w-lg border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all bg-white/50 dark:bg-slate-900/50"
                >
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                       <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {t("admin.productDetail.media.uploadPrimary")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("admin.productDetail.media.uploadHint")}
                    </p>
                    <div className="mt-6 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                      {t("admin.productDetail.media.selectFile")}
                    </div>
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
        </div>

        {/* Product Images Gallery */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1">{t("admin.productDetail.generalGallery")}</h4>
              <p className="text-xs text-slate-500">{t("admin.productDetail.sharedAssetsDesc")}</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              {t("admin.productDetail.assetsCount", { count: generalImages.length })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {generalImages.map((asset, index) => {
              const assetIndex = assets.indexOf(asset);
              return (
                <div key={assetIndex} className="group relative aspect-square rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-300">
                  <Image src={asset.url} alt={`Gallery ${index}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  
                  {/* Quick Removal */}
                  <button
                    onClick={() => removeAsset(assetIndex)}
                    className="absolute top-2 right-2 h-7 w-7 bg-white/90 dark:bg-slate-900/90 text-rose-500 rounded-lg flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Settings Overlay - Bottom Glass Header */}
                  <div className="absolute inset-x-0 bottom-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-3 border border-slate-200/50 dark:border-slate-700/50">
                      {/* Thumbnail Toggle */}
                      <button
                        onClick={() => setThumbnail(assetIndex)}
                        className={cn(
                          "w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          asset.isThumbnail 
                            ? "bg-[#D4AF37] text-white" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                      >
                        <Star className={cn("h-3 w-3", asset.isThumbnail && "fill-white")} />
                        {asset.isThumbnail ? t("admin.productDetail.mainImage") : t("admin.productDetail.makeMain")}
                      </button>

                      {/* Variant Picker */}
                      {data.variants && data.variants.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t("admin.productDetail.assignTo")}</p>
                          <select
                            value={asset.variantId || "none"}
                            onChange={(e) => updateAssetVariant(assetIndex, e.target.value === "none" ? null : e.target.value)}
                            className="w-full h-8 text-[10px] bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg px-2 text-slate-700 dark:text-slate-300 outline-none"
                          >
                            <option value="none">{t("admin.productDetail.generalProduct")}</option>
                            {data.variants.map((v) => (
                              <option key={v.id || v.sku} value={v.id || v.sku}>
                                {v.attributes?.color || "N/A"} - {v.attributes?.size || "N/A"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {asset.isThumbnail && (
                    <div className="absolute bottom-2 left-2 bg-[#D4AF37]/90 text-white p-1 rounded-md shadow-sm opacity-100 group-hover:opacity-0 transition-opacity">
                      <Star className="h-3 w-3 fill-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Grid Uploader */}
            {generalImages.length < 50 && (
              <label htmlFor="images-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all bg-slate-50/50 dark:bg-slate-900/50 group">
                <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("admin.productDetail.addAssets")}</p>
                <input id="images-upload" type="file" className="hidden" accept="image/*" multiple onChange={handleImagesUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Variant-Specific Images */}
        {variantImages.length > 0 && (
          <div>
            <div className="flex flex-col gap-2 mb-6 text-right">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">{t("admin.productDetail.variantMatrix")}</h4>
              <p className="text-xs text-slate-500 italic">{t("admin.productDetail.variantAssetsDesc")}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {variantImages.map((asset, index) => {
                const assetIndex = assets.indexOf(asset);
                const variant = data.variants?.find(
                  (v) => v.id === asset.variantId || v.sku === asset.variantId
                );
                return (
                  <div key={assetIndex} className="group relative aspect-square rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden bg-white dark:bg-slate-950 shadow-sm hover:shadow-xl transition-all duration-300">
                    <Image src={asset.url} alt={`Variant ${index}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    
                    <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {t("admin.productDetail.media.variantSpecific")}
                    </div>

                    <button
                      onClick={() => removeAsset(assetIndex)}
                      className="absolute top-2 right-2 h-7 w-7 bg-white/90 dark:bg-slate-900/90 text-rose-500 rounded-lg flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-2">
                       <div className="bg-slate-900/95 backdrop-blur-md rounded-xl p-2 text-white border border-white/10">
                          <p className="text-[10px] font-bold truncate">
                            {variant?.attributes?.color || "N/A"} • {variant?.attributes?.size || "N/A"}
                          </p>
                          <p className="text-[8px] text-slate-400 font-mono truncate">{variant?.sku || "NO SKU"}</p>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



