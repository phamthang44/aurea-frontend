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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#333738] rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-secondary/50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="text-right font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Variants</TableHead>
            <TableHead className="text-right w-[120px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              className="border-b border-border hover:bg-secondary/30 transition-colors"
            >
              <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px]">
                <div className="truncate" title={product.id}>
                  {product.id}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.categoryName || "N/A"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(product.basePrice)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.variants && product.variants.length > 0 ? (
                    product.variants.slice(0, 3).map((variant, idx) => {
                      const color = variant.attributes?.color || variant.attributes?.Color;
                      const size = variant.attributes?.size || variant.attributes?.Size;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-xs"
                        >
                          {color && (
                            <div
                              className="h-3 w-3 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )}
                          <span className="text-muted-foreground">
                            {size || color || 'Default'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">No variants</span>
                  )}
                  {product.variants && product.variants.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
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
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-600/10 hover:text-blue-700 dark:text-blue-500 dark:hover:bg-blue-500/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-600/10 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-500/10"
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

