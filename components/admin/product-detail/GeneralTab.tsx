"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GeneralTabProps {
  data: {
    name: string;
    description: string;
    categoryId: string;
    brand?: string;
    tags?: string[];
  };
  onChange: (updates: any) => void;
}

export function GeneralTab({ data, onChange }: GeneralTabProps) {
  const categories = [
    { id: "792254090050729589", name: "Áo Thun (T-Shirt)" },
    { id: "792254090050729590", name: "Áo Sơ Mi (Shirt)" },
    { id: "792254090050729591", name: "Giày (Shoes)" },
    { id: "792254090050729592", name: "Sneaker" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          General Information
        </h2>
        <p className="text-sm text-muted-foreground">
          Basic product details and categorization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name" className="text-foreground font-medium">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter product name"
            className="bg-background text-foreground text-lg"
          />
          <p className="text-xs text-muted-foreground">
            A clear, descriptive name for your product
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-foreground font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <select
            id="categoryId"
            value={data.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-foreground font-medium">
            Brand
          </Label>
          <Input
            id="brand"
            value={data.brand || ""}
            onChange={(e) => onChange({ brand: e.target.value })}
            placeholder="Product brand"
            className="bg-background text-foreground"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description" className="text-foreground font-medium">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Detailed product description..."
            rows={8}
            className="bg-background text-foreground resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Provide a detailed description of your product features and benefits
          </p>
        </div>

        {/* Tags */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="tags" className="text-foreground font-medium">
            Tags
          </Label>
          <Input
            id="tags"
            value={data.tags?.join(", ") || ""}
            onChange={(e) =>
              onChange({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
            }
            placeholder="new, featured, sale (comma-separated)"
            className="bg-background text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Add tags to help customers find your product (comma-separated)
          </p>
        </div>
      </div>
    </div>
  );
}

