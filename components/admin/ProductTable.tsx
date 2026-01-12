"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductResponse } from "@/lib/types/product";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductTableProps {
  products: ProductResponse[];
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  isLoading?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductTableProps) {
  const { t } = useTranslation();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-amber-900/30">
        <div className="inline-block h-10 w-10 border-4 border-amber-200 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin" />
        <p className="mt-6 text-sm text-gray-500 dark:text-amber-100/60 font-light tracking-wide">
          {t("admin.products.loadingCollection")}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-amber-900/30">
        <p className="text-sm text-gray-500 dark:text-amber-100/60 font-light">
          {t("admin.products.noResultsFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-amber-900/30 overflow-hidden shadow-xl dark:shadow-amber-950/30">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-amber-900/30 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
            <TableHead className="font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.id")}
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.productName")}
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.category")}
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.price")}
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.variants")}
            </TableHead>
            <TableHead className="text-right w-[120px] font-semibold text-gray-700 dark:text-amber-200 tracking-wide">
              {t("admin.products.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="border-b border-gray-100 dark:border-amber-900/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all duration-200"
            >
              <TableCell className="font-mono text-xs text-gray-500 dark:text-amber-300/70 max-w-[120px]">
                <div className="truncate" title={product.id}>
                  {product.id}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-gray-900 dark:text-amber-100">
                {product.name}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-amber-200/70 font-light">
                {product.categoryName || t("admin.products.uncategorized")}
              </TableCell>
              <TableCell className="text-right font-bold text-gray-900 dark:text-amber-300">
                {formatPrice(product.basePrice)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants && product.variants.length > 0 ? (
                    product.variants.slice(0, 3).map((variant, idx) => {
                      const color =
                        variant.attributes?.color || variant.attributes?.Color;
                      const size =
                        variant.attributes?.size || variant.attributes?.Size;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-700/40 text-xs shadow-sm"
                        >
                          {color && (
                            <div
                              className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-700 shadow-md"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )}
                          <span className="text-amber-800 dark:text-amber-200 font-semibold">
                            {size || color || "Default"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-amber-400/60 italic">
                      No variants
                    </span>
                  )}
                  {product.variants && product.variants.length > 3 && (
                    <span className="text-xs text-amber-700 dark:text-amber-300 px-2 py-1 font-medium">
                      +{product.variants.length - 3} more
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="h-9 w-9 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
