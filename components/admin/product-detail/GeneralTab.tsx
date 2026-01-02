"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { clientApi } from "@/lib/api-client";
import { CategoryResponse, ApiResult } from "@/lib/types/product";
import { toast } from "sonner";

interface GeneralTabProps {
  data: {
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
  };
  onChange: (updates: any, skipChangeTracking?: boolean) => void;
}

export function GeneralTab({ data, onChange }: GeneralTabProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await clientApi.getCategories();

        if (response.error) {
          toast.error("Failed to load categories");
        } else {
          const result = response.data as ApiResult<CategoryResponse[]>;
          setCategories(result?.data || []);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="name"
            className="text-gray-700 dark:text-amber-200/90 font-medium"
          >
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter product name"
            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 focus:border-amber-500 dark:focus:border-amber-500 text-lg"
          />
          <p className="text-xs text-gray-500 dark:text-amber-200/50">
            A clear, descriptive name for your product
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label
            htmlFor="categoryId"
            className="text-gray-700 dark:text-amber-200/90 font-medium"
          >
            Category <span className="text-red-500">*</span>
          </Label>
          <select
            id="categoryId"
            value={data.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            disabled={loadingCategories}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 dark:border-amber-700/40 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-amber-100 ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-600 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "Select a category"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Base Price */}
        <div className="space-y-2">
          <Label
            htmlFor="basePrice"
            className="text-gray-700 dark:text-amber-200/90 font-medium"
          >
            Base Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="basePrice"
            type="number"
            value={data.basePrice || 0}
            onChange={(e) => onChange({ basePrice: Number(e.target.value) })}
            placeholder="0"
            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 focus:border-amber-500 dark:focus:border-amber-500"
          />
          <p className="text-xs text-gray-500 dark:text-amber-200/50">
            Base price in VND
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="description"
            className="text-gray-700 dark:text-amber-200/90 font-medium"
          >
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Detailed product description..."
            rows={8}
            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-amber-100 border-gray-300 dark:border-amber-700/40 focus:border-amber-500 dark:focus:border-amber-500 resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-amber-200/50">
            Provide a detailed description of your product features and benefits
          </p>
        </div>
      </div>
    </div>
  );
}
