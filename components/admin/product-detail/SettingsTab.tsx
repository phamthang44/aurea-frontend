"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SettingsTabProps {
  data: {
    productStatus: "draft" | "active" | "inactive" | "archived";
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  };
  onChange: (updates: any) => void;
}

export function SettingsTab({ data, onChange }: SettingsTabProps) {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Product Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure product visibility, SEO, and advanced settings
        </p>
      </div>

      {/* Product Status */}
      <div className="space-y-4 p-6 bg-secondary/20 rounded-lg border border-border">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Product Status
          </h3>
          <p className="text-sm text-muted-foreground">
            Control the visibility of this product
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onChange({ productStatus: "draft" })}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              data.productStatus === "draft"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-border hover:border-yellow-500/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="font-medium text-foreground">Draft</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Not visible to customers
            </p>
          </button>

          <button
            onClick={() => onChange({ productStatus: "active" })}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              data.productStatus === "active"
                ? "border-green-500 bg-green-500/10"
                : "border-border hover:border-green-500/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="font-medium text-foreground">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">Visible in store</p>
          </button>

          <button
            onClick={() => onChange({ productStatus: "inactive" })}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              data.productStatus === "inactive"
                ? "border-orange-500 bg-orange-500/10"
                : "border-border hover:border-orange-500/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="font-medium text-foreground">Inactive</span>
            </div>
            <p className="text-xs text-muted-foreground">Temporarily hidden</p>
          </button>

          <button
            onClick={() => onChange({ productStatus: "archived" })}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              data.productStatus === "archived"
                ? "border-gray-500 bg-gray-500/10"
                : "border-border hover:border-gray-500/50"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="font-medium text-foreground">Archived</span>
            </div>
            <p className="text-xs text-muted-foreground">Permanently hidden</p>
          </button>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Search Engine Optimization
          </h3>
          <p className="text-sm text-muted-foreground">
            Optimize how this product appears in search results
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle" className="text-foreground font-medium">
              SEO Title
            </Label>
            <Input
              id="seoTitle"
              value={data.seoTitle || ""}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
              placeholder="Product name - Brand name"
              className="bg-background text-foreground"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {(data.seoTitle || "").length}/60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="seoDescription"
              className="text-foreground font-medium"
            >
              SEO Description
            </Label>
            <Textarea
              id="seoDescription"
              value={data.seoDescription || ""}
              onChange={(e) => onChange({ seoDescription: e.target.value })}
              placeholder="Brief description of the product for search engines..."
              rows={3}
              className="bg-background text-foreground resize-none"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {(data.seoDescription || "").length}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="seoKeywords"
              className="text-foreground font-medium"
            >
              SEO Keywords
            </Label>
            <Input
              id="seoKeywords"
              value={data.seoKeywords || ""}
              onChange={(e) => onChange({ seoKeywords: e.target.value })}
              placeholder="keyword1, keyword2, keyword3"
              className="bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords for search optimization
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-6 bg-secondary/20 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Search Preview
        </h3>
        <div className="space-y-1">
          <div className="text-blue-600 dark:text-blue-500 text-lg hover:underline cursor-pointer">
            {data.seoTitle || "Product Title"}
          </div>
          <div className="text-green-700 dark:text-green-500 text-xs">
            https://aurea.com/products/...
          </div>
          <div className="text-sm text-muted-foreground">
            {data.seoDescription || "Product description will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
}
