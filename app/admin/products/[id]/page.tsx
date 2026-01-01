"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GeneralTab } from "@/components/admin/product-detail/GeneralTab";
import { MediaTab } from "@/components/admin/product-detail/MediaTab";
import { VariantsTab } from "@/components/admin/product-detail/VariantsTab";
import { SettingsTab } from "@/components/admin/product-detail/SettingsTab";
import { clientApi } from "@/lib/api-client";
import { ProductResponse, ApiResult } from "@/lib/types/product";
import { productApi } from "@/lib/api/product";

type Tab = "general" | "media" | "variants" | "settings";

interface ProductData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  thumbnail?: string;
  images?: string[];
  variants?: any[];
  slug?: string;
  productStatus: "draft" | "active" | "inactive" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Store original data for change detection
  const [originalData, setOriginalData] = useState<ProductData | null>(null);

  const [productData, setProductData] = useState<ProductData>({
    id: productId,
    name: "",
    description: "",
    categoryId: "",
    basePrice: 0,
    thumbnail: "",
    images: [],
    variants: [],
    slug: "",
    productStatus: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Load product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await clientApi.getProductById(productId);

        if (response.error) {
          const errorMsg = response.error.message || "Failed to load product";
          const traceId = (response.error as any).traceId;
          console.error("Product fetch error:", {
            productId,
            error: response.error,
            traceId,
          });
          toast.error(traceId ? `${errorMsg} (Trace: ${traceId})` : errorMsg);
          router.push("/admin/products");
        } else {
          const result = response.data as ApiResult<ProductResponse>;
          const product = result?.data;

          console.log("=== PRODUCT FETCH DEBUG ===");
          console.log("Full product response:", product);
          console.log("Product variants:", product?.variants);
          if (product?.variants && product.variants.length > 0) {
            console.log("First variant:", product.variants[0]);
            console.log(
              "First variant keys:",
              Object.keys(product.variants[0])
            );
          }
          console.log("=========================");

          if (product) {
            // Extract variant images from product.images (type: VARIANT)
            const variantImagesMap = new Map();
            if (product.images) {
              product.images.forEach((img: any) => {
                if (
                  img.type === "VARIANT" &&
                  img.key === "color" &&
                  img.value
                ) {
                  variantImagesMap.set(img.value, img.url);
                }
              });
            }

            // Enrich variants with their images
            const enrichedVariants = (product.variants || []).map((v: any) => ({
              ...v,
              imageUrl: variantImagesMap.get(v.attributes?.color) || null,
            }));

            const loadedData = {
              id: product.id,
              name: product.name || "",
              description: product.description || "",
              categoryId: product.categoryId || "",
              basePrice: product.basePrice || 0,
              thumbnail: product.thumbnail || "",
              // Convert ProductImage[] to string[] (extract URLs only)
              images: Array.isArray(product.images)
                ? product.images
                    .filter((img: any) => img.type === "GENERAL")
                    .map((img: any) =>
                      typeof img === "string" ? img : img.url
                    )
                : [],
              variants: enrichedVariants,
              slug: product.slug || "",
              productStatus: (
                (product as any).status || "DRAFT"
              ).toLowerCase() as "draft" | "active" | "inactive" | "archived",
              seoTitle: "",
              seoDescription: "",
              seoKeywords: "",
            };

            setProductData(loadedData);
            setOriginalData(JSON.parse(JSON.stringify(loadedData))); // Deep clone
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(
          `Failed to load product: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const tabs = [
    { id: "general" as Tab, label: "General", icon: "📝" },
    { id: "media" as Tab, label: "Media", icon: "🖼️" },
    { id: "variants" as Tab, label: "Variants & Pricing", icon: "💰" },
    { id: "settings" as Tab, label: "Settings", icon: "⚙️" },
  ];

  // Detect what changed to call the minimal API
  const detectChanges = () => {
    if (!originalData) return { type: "none" };

    const changes = {
      status: productData.productStatus !== originalData.productStatus,
      generalInfo:
        productData.name !== originalData.name ||
        productData.description !== originalData.description ||
        productData.basePrice !== originalData.basePrice ||
        productData.categoryId !== originalData.categoryId,
      media:
        productData.thumbnail !== originalData.thumbnail ||
        JSON.stringify(productData.images) !==
          JSON.stringify(originalData.images),
      variants:
        JSON.stringify(productData.variants) !==
        JSON.stringify(originalData.variants),
    };

    console.log("=== CHANGE DETECTION DEBUG ===");
    console.log(
      "Original status:",
      originalData.productStatus,
      typeof originalData.productStatus
    );
    console.log(
      "Current status:",
      productData.productStatus,
      typeof productData.productStatus
    );
    console.log("Changes detected:", changes);
    console.log("==============================");

    // Priority: status > variants > media > generalInfo
    if (
      changes.status &&
      !changes.generalInfo &&
      !changes.media &&
      !changes.variants
    ) {
      return { type: "status" };
    }
    if (changes.variants) {
      return { type: "full" }; // Variants changed = full update
    }
    if (changes.media && !changes.generalInfo) {
      return { type: "media" }; // Only images changed
    }
    if (changes.generalInfo || changes.media) {
      return { type: "generalInfo" }; // General info or combined with media
    }

    return { type: "none" };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let response: any;
      const changeType = detectChanges();

      console.log("=== SMART SAVE DETECTION ===");
      console.log("Change type detected:", changeType.type);
      console.log("============================");

      if (changeType.type === "none") {
        toast.info("No changes to save");
        setIsSaving(false);
        return;
      }

      // 1. STATUS ONLY - Call PATCH /api/v1/products/{id}/status
      if (changeType.type === "status") {
        console.log("📍 Calling STATUS update endpoint");
        response = await productApi.updateProductStatus(productId, {
          productStatus: productData.productStatus.toUpperCase(), // Convert to DRAFT/ACTIVE/INACTIVE/ARCHIVED
        });
      }
      // 2. VARIANTS CHANGED - Call PUT /api/v1/products/{id} (full update)
      else if (changeType.type === "full") {
        console.log("📍 Calling FULL update endpoint (variants changed)");

        // Collect general images + variant-specific images
        const generalImages = (productData.images || []).map((url) => ({
          url,
          type: "GENERAL",
        }));

        const variantImages = (productData.variants || [])
          .filter((v: any) => v.imageUrl)
          .map((v: any) => ({
            url: v.imageUrl,
            type: "VARIANT",
            key: "color",
            value: v.attributes?.color || "",
          }));

        const allImages = [...generalImages, ...variantImages];

        const updatePayload = {
          name: productData.name,
          description: productData.description,
          basePrice: productData.basePrice,
          categoryId: productData.categoryId,
          images: allImages.map((img: any) => img.url),
          isActive: productData.productStatus === "active",
          variants:
            productData.variants?.map((variant: any) => ({
              id: variant.id,
              sku: variant.sku,
              attributes: variant.attributes || {},
              priceOverride: variant.priceOverride || variant.price,
              isActive: variant.isActive !== false,
            })) || [],
        };

        response = await productApi.updateProduct(productId, updatePayload);
      }
      // 3. MEDIA ONLY or GENERAL INFO - Call PATCH /api/v1/products/{id}
      else if (
        changeType.type === "media" ||
        changeType.type === "generalInfo"
      ) {
        console.log(
          `📍 Calling GENERAL INFO update endpoint (${changeType.type})`
        );

        const generalInfoPayload = {
          name: productData.name,
          description: productData.description,
          basePrice: productData.basePrice,
          categoryId: productData.categoryId,
          images: productData.images || [],
        };

        response = await productApi.updateProductInfo(
          productId,
          generalInfoPayload
        );
      }

      if (response?.error) {
        const errorMsg = response.error.message || "Failed to save product";
        const traceId = (response.error as any).traceId;
        console.error("Product save error:", {
          productId,
          error: response.error,
          traceId,
        });
        toast.error(traceId ? `${errorMsg} (Trace: ${traceId})` : errorMsg);
      } else {
        toast.success(`Product saved successfully (${changeType.type} update)`);
        setHasChanges(false);

        // Refresh product data from backend
        // response.data contains the backend response structure
        const result = response.data as ApiResult<ProductResponse>;
        const updatedProduct = result?.data;

        if (updatedProduct) {
          // Extract variant images from product.images
          const variantImagesMap = new Map();
          if (updatedProduct.images) {
            updatedProduct.images.forEach((img: any) => {
              if (img.type === "VARIANT" && img.key === "color" && img.value) {
                variantImagesMap.set(img.value, img.url);
              }
            });
          }

          // Enrich variants with their images
          const enrichedVariants = (updatedProduct.variants || []).map(
            (v: any) => ({
              ...v,
              imageUrl: variantImagesMap.get(v.attributes?.color) || null,
            })
          );

          const refreshedData = {
            id: updatedProduct.id,
            name: updatedProduct.name || "",
            description: updatedProduct.description || "",
            categoryId: updatedProduct.categoryId || "",
            basePrice: updatedProduct.basePrice || 0,
            thumbnail: updatedProduct.thumbnail || "",
            // Convert ProductImage[] to string[] (extract URLs only)
            images: Array.isArray(updatedProduct.images)
              ? updatedProduct.images
                  .filter((img: any) => img.type === "GENERAL")
                  .map((img: any) => (typeof img === "string" ? img : img.url))
              : [],
            variants: enrichedVariants,
            slug: updatedProduct.slug || "",
            productStatus: (
              (updatedProduct as any).status || "DRAFT"
            ).toLowerCase() as "draft" | "active" | "inactive" | "archived",
            seoTitle: "",
            seoDescription: "",
            seoKeywords: "",
          };

          setProductData(refreshedData);
          setOriginalData(JSON.parse(JSON.stringify(refreshedData))); // Update baseline
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        `Failed to save product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.push("/admin/products");
      }
    } else {
      router.push("/admin/products");
    }
  };

  const updateProductData = (updates: Partial<ProductData>) => {
    console.log("=== UPDATE PRODUCT DATA ===");
    console.log("Updates received:", updates);
    console.log("Current productData:", productData);
    console.log("===========================");
    setProductData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-amber-200 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-amber-100/60">
              Loading product...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Sticky Header Bar - Account for main navbar height */}
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-amber-900/30 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
                {/* Left: Back Button & Title */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-initial">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-amber-200 dark:to-yellow-100 bg-clip-text text-transparent truncate">
                      {productData.name || "New Product"}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-amber-200/50 truncate">
                      ID: {productId}
                    </p>
                  </div>
                  {hasChanges && (
                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 whitespace-nowrap">
                      Unsaved changes
                    </span>
                  )}
                </div>

                {/* Help Text for Variants Tab */}
                {activeTab === "variants" && (
                  <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-md border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 dark:text-blue-400">💡</span>
                    <span>
                      <strong>Individual saves:</strong> Click save icon in each
                      row | <strong>Bulk save:</strong> Click &apos;Save All
                      Changes&apos; below
                    </span>
                  </div>
                )}

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10 flex-1 sm:flex-initial h-9 sm:h-10"
                  >
                    <CloseIcon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30 font-semibold flex-1 sm:flex-initial h-9 sm:h-10"
                    title={
                      activeTab === "variants"
                        ? "Save all product info & new variants (existing variants must be saved individually)"
                        : "Save product information"
                    }
                  >
                    <Save className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {isSaving
                        ? "Saving..."
                        : activeTab === "variants"
                        ? "Save All Changes"
                        : "Save Changes"}
                    </span>
                    <span className="sm:hidden">
                      {isSaving ? "..." : "Save"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap group",
                      activeTab === tab.id
                        ? "border-amber-500 dark:border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                        : "border-transparent text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200 hover:border-gray-300 dark:hover:border-amber-700/40 hover:bg-gray-50 dark:hover:bg-amber-900/5"
                    )}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-amber-900/30 rounded-lg sm:rounded-xl shadow-xl dark:shadow-amber-950/30 p-4 sm:p-5 md:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
              {activeTab === "general" && (
                <GeneralTab data={productData} onChange={updateProductData} />
              )}
              {activeTab === "media" && (
                <MediaTab data={productData} onChange={updateProductData} />
              )}
              {activeTab === "variants" && (
                <VariantsTab data={productData} onChange={updateProductData} />
              )}
              {activeTab === "settings" && (
                <SettingsTab data={productData} onChange={updateProductData} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
