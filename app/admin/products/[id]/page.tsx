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

type Tab = "general" | "media" | "variants" | "settings";

interface ProductData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  brand?: string;
  tags?: string[];
  basePrice: number;
  thumbnail?: string;
  images?: string[];
  variants?: any[];
  status: "draft" | "active" | "archived";
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
  const [hasChanges, setHasChanges] = useState(false);

  const [productData, setProductData] = useState<ProductData>({
    id: productId,
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    tags: [],
    basePrice: 0,
    thumbnail: "",
    images: [],
    variants: [],
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Load product data
  useEffect(() => {
    // TODO: Fetch product data from API
    // For now, mock data
    const mockProduct: ProductData = {
      id: productId,
      name: "Sample Product",
      description: "Product description here...",
      categoryId: "792254090050729589",
      brand: "Aurea Brand",
      tags: ["new", "featured"],
      basePrice: 1500000,
      thumbnail: "",
      images: [],
      variants: [],
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    };
    setProductData(mockProduct);
  }, [productId]);

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
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0E0E0E]">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#1A1A1A] border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {productData.name || "New Product"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  ID: {productId}
                </p>
              </div>
              {hasChanges && (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
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
                className="border-2 border-border text-foreground hover:bg-secondary"
              >
                <CloseIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
                    ? "border-blue-600 text-blue-600 dark:text-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{tab.icon}</span>
                  <div className="flex flex-col items-start">
                    <span>{tab.label}</span>
                    <span className={cn(
                      "text-xs font-normal",
                      activeTab === tab.id ? "text-blue-500/70" : "text-muted-foreground/70"
                    )}>
                      {tab.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-lg border border-border p-6 min-h-[600px]">
          {activeTab === "general" && (
            <GeneralTab
              data={productData}
              onChange={updateProductData}
            />
          )}
          {activeTab === "media" && (
            <MediaTab
              data={productData}
              onChange={updateProductData}
            />
          )}
          {activeTab === "variants" && (
            <VariantsTab
              data={productData}
              onChange={updateProductData}
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              data={productData}
              onChange={updateProductData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

