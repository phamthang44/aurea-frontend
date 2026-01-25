"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  History,
  Package,
  ArrowRight,
  ArrowDownToLine,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Clock,
  Boxes,
  RefreshCw,
} from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

interface TransactionApiResponse {
  data: InventoryTransaction[];
  meta?: {
    totalElements?: number;
  };
}

interface InventoryTransaction {
  id: string;
  variantId: string;
  type:
    | "IMPORT"
    | "ADJUST"
    | "DAMAGED"
    | "RETURN"
    | "RESERVE"
    | "RELEASE"
    | "CONFIRM"
    | "OPENING_BALANCE";
  quantityDelta: number;
  beforeQuantity: number;
  afterQuantity: number;
  beforeReserved?: number;
  afterReserved?: number;
  reference: string;
  note: string;
  performedBy: {
    username?: string;
    email?: string;
    id?: number;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface TransactionHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
  thumbnailUrl?: string;
  currentAvailable: number;
  currentReserved: number;
}

/**
 * Transaction Type Configuration
 */
const TRANSACTION_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  IMPORT: {
    icon: ArrowDownToLine,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  ADJUST: {
    icon: ArrowRightLeft,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  RESERVE: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  CONFIRM: {
    icon: CheckCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  RELEASE: {
    icon: RotateCcw,
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  DAMAGED: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
  },
  RETURN: {
    icon: RotateCcw,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  OPENING_BALANCE: {
    icon: Boxes,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
};

export function TransactionHistoryDrawer({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
  thumbnailUrl,
  currentAvailable,
  currentReserved,
}: TransactionHistoryDrawerProps) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getInventoryTransactions(
        variantId,
        page,
        pageSize
      );
      if (response.data) {
        const result = response.data as TransactionApiResponse;
        setData(result.data || []);
        setTotalElements(result.meta?.totalElements || 0);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsLoading(false);
    }
  }, [variantId, page, pageSize]);

  useEffect(() => {
    if (open && variantId) {
      fetchHistory();
      setImageError(false);
    } else {
      setData([]);
      setPage(0);
    }
  }, [open, variantId, fetchHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (i18n.language === "vi") {
      // 15:30 25/01/2026
      const time = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
      const day = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
      return `${time} ${day}`;
    }
    // Jan 25, 2026, 10:30 AM
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionConfig = (type: string) => {
    const config = TRANSACTION_CONFIG[type];
    const label = t(`admin.inventory.history.types.${type}.label`, {
      defaultValue: type,
    });
    const description = t(`admin.inventory.history.types.${type}.description`, {
      defaultValue: t("admin.inventory.history.unknownType"),
    });

    return {
      ...(config || {
        icon: Package,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      }),
      label,
      description,
    };
  };

  const isReservationTransaction = (type: string) => {
    return type === "RESERVE" || type === "RELEASE";
  };

  const renderChangeIndicator = (tx: InventoryTransaction) => {
    const isReservation = isReservationTransaction(tx.type);

    if (isReservation) {
      const reservedDelta = (tx.afterReserved ?? 0) - (tx.beforeReserved ?? 0);
      return (
        <div className="flex flex-col items-end">
          <span
            className={`text-sm font-bold tabular-nums ${
              reservedDelta > 0
                ? "text-blue-600"
                : reservedDelta < 0
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            {reservedDelta > 0 ? "+" : ""}
            {reservedDelta}
          </span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">
            {t("admin.inventory.history.reserved")}
          </span>
        </div>
      );
    }

    return (
      <span
        className={`text-sm font-bold tabular-nums ${
          tx.quantityDelta > 0
            ? "text-emerald-600"
            : tx.quantityDelta < 0
            ? "text-rose-600"
            : "text-slate-400"
        }`}
      >
        {tx.quantityDelta > 0 ? "+" : ""}
        {tx.quantityDelta}
      </span>
    );
  };

  const renderBalanceChange = (tx: InventoryTransaction) => {
    const isReservation = isReservationTransaction(tx.type);

    if (isReservation) {
      return (
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 w-8 text-right">
              {t("admin.inventory.history.rsvShort")}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {tx.beforeReserved ?? 0}
            </span>
            <ArrowRight className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 tabular-nums">
              {tx.afterReserved ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 w-8 text-right">
              {t("admin.inventory.history.avlShort")}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              {tx.beforeQuantity - (tx.beforeReserved ?? 0)}
            </span>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {tx.afterQuantity - (tx.afterReserved ?? 0)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs text-slate-400 tabular-nums">
          {tx.beforeQuantity}
        </span>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {tx.afterQuantity}
        </span>
      </div>
    );
  };

  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[80vw] sm:max-w-[1100px] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <SheetHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              <History className="h-7 w-7 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("admin.inventory.history.title")}
              </SheetTitle>
              <SheetDescription className="text-base mt-1 text-slate-600 dark:text-slate-400">
                {t("admin.inventory.history.drawerDescription")}
              </SheetDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("common.refresh")}
            </Button>
          </div>
        </SheetHeader>

        {/* Product Info Bar */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-6">
            {/* Product thumbnail */}
            {thumbnailUrl && !imageError ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                <Image
                  src={thumbnailUrl}
                  alt={productName}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
            ) : (
              <ProductImagePlaceholder size="md" />
            )}

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {productName || t("admin.inventory.unknownProduct")}
              </p>
              <code className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {variantSku}
              </code>
            </div>

            {/* Stock summary */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                  {t("admin.inventory.available")}
                </p>
                <p className={`text-2xl font-bold tabular-nums ${
                  currentAvailable <= 0 ? "text-rose-600 dark:text-rose-500" : "text-emerald-600"
                }`}>
                  {currentAvailable}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                  {t("admin.inventory.reserved")}
                </p>
                <p className="text-2xl font-bold text-amber-600 tabular-nums">
                  {currentReserved}
                </p>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                  {t("admin.inventory.total")}
                </p>
                <p className={`text-2xl font-bold tabular-nums ${
                  currentAvailable + currentReserved <= 0 
                    ? "text-rose-600 dark:text-rose-500" 
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  {currentAvailable + currentReserved}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-slate-400 mb-4" />
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 mx-8 my-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Package className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-500">
                {t("admin.inventory.history.noData")}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {t("admin.inventory.history.noDataHint")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent bg-slate-50/80 dark:bg-slate-900/50">
                  <TableHead className="w-[150px] text-xs font-semibold text-slate-600 dark:text-slate-400 pl-8">
                    {t("admin.inventory.history.date")}
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.type")}
                  </TableHead>
                  <TableHead className="text-right w-[90px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.change")}
                  </TableHead>
                  <TableHead className="text-center w-[150px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.balance")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.reference")}
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-slate-600 dark:text-slate-400 pr-8">
                    {t("admin.inventory.history.performedBy")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((tx) => {
                  const config = getTransactionConfig(tx.type);
                  const Icon = config.icon;

                  return (
                    <TableRow
                      key={tx.id}
                      className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                    >
                      {/* Date */}
                      <TableCell className="py-4 pl-8">
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                          {formatDate(tx.createdAt)}
                        </span>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`gap-1.5 text-xs font-semibold uppercase tracking-wide border-0 cursor-pointer hover:opacity-80 transition-opacity ${config.color} ${config.bgColor}`}
                          title={config.description}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                      </TableCell>

                      {/* Change */}
                      <TableCell className="py-4 text-right">
                        {renderChangeIndicator(tx)}
                      </TableCell>

                      {/* Balance */}
                      <TableCell className="py-4">
                        {renderBalanceChange(tx)}
                      </TableCell>

                      {/* Reference & Note */}
                      <TableCell className="py-4 max-w-[250px]">
                        {tx.reference && (
                          <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {tx.reference}
                          </code>
                        )}
                        {tx.note && (
                          <p
                            className="text-sm text-slate-500 mt-1 truncate"
                            title={tx.note}
                          >
                            {tx.note}
                          </p>
                        )}
                        {!tx.reference && !tx.note && (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>

                      {/* Performed By */}
                      <TableCell className="py-4 pr-8">
                        <div className="flex items-center gap-2 max-w-[150px]">
                          {tx.performedBy?.avatarUrl ? (
                            <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                              <Image 
                                src={tx.performedBy.avatarUrl} 
                                alt={tx.performedBy.username || ''}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400">
                                {(tx.performedBy?.username || tx.performedBy?.email || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex flex-col">
                            <span 
                              className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate"
                              title={tx.performedBy?.username || tx.performedBy?.email || 'SYSTEM'}
                            >
                              {tx.performedBy?.username || tx.performedBy?.email || 'SYSTEM'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Footer */}
        {data.length > 0 && (
          <>
            <Separator />
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between flex-shrink-0">
              <p className="text-sm text-slate-500">
                {t("common.pagination.showing", {
                  count: data.length,
                  total: totalElements,
                })}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-sm cursor-pointer"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0 || isLoading}
                >
                  {t("common.pagination.prev")}
                </Button>
                <span className="text-sm font-medium text-slate-600 min-w-[80px] text-center">
                  {t("common.pagination.page", {
                    current: page + 1,
                    total: totalPages || 1,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-sm cursor-pointer"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page + 1 >= totalPages || isLoading}
                >
                  {t("common.pagination.next")}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Legend */}
        {data.length > 0 && (
          <>
            <Separator />
            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {t("admin.inventory.history.legend")}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {Object.entries(TRANSACTION_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  const label = t(`admin.inventory.history.types.${type}.label`, {
                    defaultValue: type,
                  });
                  const description = t(
                    `admin.inventory.history.types.${type}.description`,
                    { defaultValue: "" }
                  );
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      <div
                        className={`h-6 w-6 rounded flex items-center justify-center ${config.bgColor}`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{label}:</span> {description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
