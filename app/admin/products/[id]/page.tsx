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
  status: "draft" | "active" | "inactive" | "archived";
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
    status: "draft",
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

          if (product) {
            setProductData({
              id: product.id,
              name: product.name || "",
              description: product.description || "",
              categoryId: product.categoryId || "",
              basePrice: product.basePrice || 0,
              thumbnail: product.thumbnail || "",
              images: product.images || [],
              variants: product.variants || [],
              slug: product.slug || "",
              status: (product as any).status || "draft",
              seoTitle: "",
              seoDescription: "",
              seoKeywords: "",
            });
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save product data to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Product saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save product");
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left: Back Button & Title */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-amber-200 dark:to-yellow-100 bg-clip-text text-transparent">
                      {productData.name || "New Product"}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-amber-200/50">
                      ID: {productId}
                    </p>
                  </div>
                  {hasChanges && (
                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                      Unsaved changes
                    </span>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border border-gray-300 dark:border-amber-700/40 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-900/10"
                  >
                    <CloseIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 dark:from-amber-500 dark:to-yellow-500 dark:hover:from-amber-600 dark:hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-900/30 font-semibold"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap group",
                      activeTab === tab.id
                        ? "border-amber-500 dark:border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                        : "border-transparent text-gray-500 dark:text-amber-200/60 hover:text-gray-900 dark:hover:text-amber-200 hover:border-gray-300 dark:hover:border-amber-700/40 hover:bg-gray-50 dark:hover:bg-amber-900/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-amber-900/30 rounded-xl shadow-xl dark:shadow-amber-950/30 p-6 min-h-[600px]">
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
