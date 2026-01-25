"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  ArrowDownToLine, 
  ArrowRightLeft, 
  History, 
  RefreshCw, 
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { ImportStockDrawer } from "./ImportStockDrawer";
import { AdjustStockDrawer } from "./AdjustStockDrawer";
import { TransactionHistoryDrawer } from "./TransactionHistoryDrawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

// Inline component to handle image errors in table
function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  
  if (!src || hasError) {
    return <ProductImagePlaceholder size="sm" />;
  }
  
  return (
    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

interface InventoryApiResponse {
  data: InventoryItem[];
  meta?: {
    totalElements?: number;
  };
}

interface AuditorResponse {
  username?: string;
  email?: string;
  id?: number;
  avatarUrl?: string;
}

interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableStock: number;
  reorderLevel?: number;
  productName?: string;
  categoryName?: string;
  thumbnailUrl?: string;
  attributes?: Record<string, string>;
  price?: number;
  costPrice?: number;
}

const LOW_STOCK_THRESHOLD = 10;

export function InventoryTable() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getInventories({ 
        page: currentPage,
        size: pageSize,
        keyword: searchTerm 
      });

      if (response.data) {
        const inventoryData = response.data as InventoryApiResponse;
        setItems(inventoryData.data || []);
        setTotalElements(inventoryData.meta?.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch inventory data", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (currentPage === 0) {
            fetchData();
        } else {
            setCurrentPage(0);
        }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchData]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const handleAction = (action: 'import' | 'adjust' | 'history', item: InventoryItem) => {
      setSelectedItem(item);
      if (action === 'import') setImportDialogOpen(true);
      if (action === 'adjust') setAdjustDialogOpen(true);
      if (action === 'history') setHistoryDialogOpen(true);
  };

  const handleRefresh = () => {
      fetchData();
  };

  const getStockStatus = (item: InventoryItem) => {
    const threshold = item.reorderLevel ?? LOW_STOCK_THRESHOLD;
    if (item.availableStock <= 0) return 'out';
    if (item.availableStock <= threshold) return 'low';
    return 'ok';
  };

  const renderStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);
    if (status === 'out') {
      return (
        <Badge variant="outline" className="gap-1 text-[10px] font-medium text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-900/20">
          <AlertTriangle className="h-3 w-3" />
          {t("admin.inventory.status.outOfStock")}
        </Badge>
      );
    }
    if (status === 'low') {
      return (
        <Badge variant="outline" className="gap-1 text-[10px] font-medium text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-3 w-3" />
          {t("admin.inventory.status.lowStock")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-[10px] font-medium text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
        <CheckCircle2 className="h-3 w-3" />
        {t("admin.inventory.status.inStock")}
      </Badge>
    );
  };

  const renderVariantAttributes = (item: InventoryItem) => {
    if (!item.attributes || Object.keys(item.attributes).length === 0) {
      return <span className="text-slate-400 text-xs">—</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(item.attributes).map(([key, val]) => (
          <span 
            key={key} 
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {val}
          </span>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("admin.inventory.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-9"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          className="gap-2 h-9"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <TableHead className="w-[280px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.product")}
              </TableHead>
              <TableHead className="w-[180px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.variant")}
              </TableHead>
              <TableHead className="text-right w-[100px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.available")}
              </TableHead>
              <TableHead className="text-right w-[100px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.reserved")}
              </TableHead>
              <TableHead className="w-[110px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.status.label")}
              </TableHead>
              <TableHead className="text-right w-[140px] font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.inventory.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="text-sm text-slate-500">{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-10 w-10 text-slate-300" />
                    <span className="text-sm text-slate-500">{t("admin.inventory.noResults")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => handleAction('import', item)}
                >
                  {/* Product Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumbnail 
                        src={item.thumbnailUrl} 
                        alt={item.productName || ''} 
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.productName || t("admin.inventory.unknownProduct")}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.categoryName || '—'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Variant (SKU + Attributes) */}
                  <TableCell>
                    <div className="space-y-1">
                      <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.sku}
                      </code>
                      {renderVariantAttributes(item)}
                    </div>
                  </TableCell>

                  {/* Available (Highlighted) */}
                  <TableCell className="text-right">
                    <span className={`text-lg font-bold tabular-nums ${
                      item.availableStock <= 0 
                        ? 'text-rose-600 dark:text-rose-500' 
                        : item.availableStock <= (item.reorderLevel ?? LOW_STOCK_THRESHOLD)
                          ? 'text-amber-600 dark:text-amber-500'
                          : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {item.availableStock ?? 0}
                    </span>
                  </TableCell>

                  {/* Reserved (Muted) */}
                  <TableCell className="text-right">
                    <span className="text-sm font-medium tabular-nums text-slate-400">
                      {item.reservedQuantity ?? 0}
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    {renderStockBadge(item)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <TooltipProvider delayDuration={100}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); handleAction('import', item); }}
                            >
                              <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("admin.inventory.menuActions.import")}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); handleAction('adjust', item); }}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("admin.inventory.menuActions.adjust")}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); handleAction('history', item); }}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("admin.inventory.menuActions.history")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          {t("common.pagination.showing", { count: items.length, total: totalElements })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
            className="h-8"
          >
            {t("common.pagination.prev")}
          </Button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[80px] text-center">
            {t("common.pagination.page", { current: currentPage + 1, total: totalPages || 1 })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage + 1 >= totalPages || isLoading}
            className="h-8"
          >
            {t("common.pagination.next")}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {selectedItem && (
        <>
          <ImportStockDrawer 
            open={importDialogOpen} 
            onOpenChange={setImportDialogOpen} 
            variantId={selectedItem.variantId}
            variantSku={selectedItem.sku}
            productName={selectedItem.productName || ''}
            currentStock={selectedItem.availableStock}
            thumbnailUrl={selectedItem.thumbnailUrl}
            currentCostPrice={selectedItem.costPrice}
            onSuccess={handleRefresh}
          />
          <AdjustStockDrawer 
            open={adjustDialogOpen} 
            onOpenChange={setAdjustDialogOpen} 
            variantId={selectedItem.variantId}
            variantSku={selectedItem.sku}
            productName={selectedItem.productName || ''}
            currentStock={selectedItem.quantity || 0}
            thumbnailUrl={selectedItem.thumbnailUrl}
            onSuccess={handleRefresh}
          />
          <TransactionHistoryDrawer 
            open={historyDialogOpen} 
            onOpenChange={setHistoryDialogOpen} 
            variantId={selectedItem.variantId}
            variantSku={selectedItem.sku}
            productName={selectedItem.productName || ''}
            thumbnailUrl={selectedItem.thumbnailUrl}
            currentAvailable={selectedItem.availableStock}
            currentReserved={selectedItem.reservedQuantity}
          />
        </>
      )}
    </div>
  );
}
