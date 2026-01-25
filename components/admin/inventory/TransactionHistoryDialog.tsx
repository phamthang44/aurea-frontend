"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Boxes
} from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { useTranslation } from "react-i18next";

interface TransactionApiResponse {
  data: InventoryTransaction[];
  meta?: {
    totalElements?: number;
  };
}

/**
 * Interface matching InventoryTransactionResponse from backend
 */
interface InventoryTransaction {
  id: string;
  variantId: string;
  type: 'IMPORT' | 'ADJUST' | 'DAMAGED' | 'RETURN' | 'RESERVE' | 'RELEASE' | 'CONFIRM' | 'OPENING_BALANCE';
  quantityDelta: number;
  beforeQuantity: number;
  afterQuantity: number;
  beforeReserved?: number;
  afterReserved?: number;
  reference: string;
  note: string;
  performedBy: string;
  createdAt: string;
}

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantId: string;
  variantSku: string;
  productName: string;
  currentAvailable: number;
  currentReserved: number;
}

/**
 * Transaction Type Configuration
 * Maps transaction types to their visual properties
 */
const TRANSACTION_CONFIG: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  label: string;
  description: string;
}> = {
  IMPORT: { 
    icon: ArrowDownToLine, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', 
    label: 'Import',
    description: 'Stock imported from supplier'
  },
  ADJUST: { 
    icon: ArrowRightLeft, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 dark:bg-amber-900/20', 
    label: 'Adjust',
    description: 'Manual stock adjustment'
  },
  RESERVE: { 
    icon: Clock, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20', 
    label: 'Reserve',
    description: 'Stock reserved for order'
  },
  CONFIRM: { 
    icon: CheckCircle, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 dark:bg-purple-900/20', 
    label: 'Confirm',
    description: 'Reserved stock shipped'
  },
  RELEASE: { 
    icon: RotateCcw, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100 dark:bg-slate-800', 
    label: 'Release',
    description: 'Reserved stock released'
  },
  DAMAGED: { 
    icon: AlertTriangle, 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-50 dark:bg-rose-900/20', 
    label: 'Damaged',
    description: 'Stock marked as damaged/lost'
  },
  RETURN: { 
    icon: RotateCcw, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', 
    label: 'Return',
    description: 'Customer returned goods'
  },
  OPENING_BALANCE: { 
    icon: Boxes, 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', 
    label: 'Opening',
    description: 'Initial stock balance'
  },
};

export function TransactionHistoryDialog({
  open,
  onOpenChange,
  variantId,
  variantSku,
  productName,
  currentAvailable,
  currentReserved,
}: TransactionHistoryDialogProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await clientApi.getInventoryTransactions(variantId, page, pageSize);
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
    } else {
      setData([]);
      setPage(0);
    }
  }, [open, variantId, fetchHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionConfig = (type: string) => {
    return TRANSACTION_CONFIG[type] || { 
      icon: Package, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-50', 
      label: type,
      description: 'Unknown transaction type'
    };
  };

  /**
   * Determines if a transaction type affects reservations rather than stock levels
   */
  const isReservationTransaction = (type: string) => {
    return type === 'RESERVE' || type === 'RELEASE';
  };

  /**
   * Renders the change indicator for stock or reservation changes
   */
  const renderChangeIndicator = (tx: InventoryTransaction) => {
    const isReservation = isReservationTransaction(tx.type);
    
    if (isReservation) {
      // For RESERVE/RELEASE, show reserved change
      const reservedDelta = (tx.afterReserved ?? 0) - (tx.beforeReserved ?? 0);
      return (
        <div className="flex flex-col items-end">
          <span className={`text-sm font-bold tabular-nums ${
            reservedDelta > 0 
              ? 'text-blue-600' 
              : reservedDelta < 0 
                ? 'text-slate-600' 
                : 'text-slate-400'
          }`}>
            {reservedDelta > 0 ? '+' : ''}{reservedDelta}
          </span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">reserved</span>
        </div>
      );
    }
    
    // For stock-affecting transactions, show quantity delta
    return (
      <span className={`text-sm font-bold tabular-nums ${
        tx.quantityDelta > 0 
          ? 'text-emerald-600' 
          : tx.quantityDelta < 0 
            ? 'text-rose-600' 
            : 'text-slate-400'
      }`}>
        {tx.quantityDelta > 0 ? '+' : ''}{tx.quantityDelta}
      </span>
    );
  };

  /**
   * Renders the balance change (before → after)
   */
  const renderBalanceChange = (tx: InventoryTransaction) => {
    const isReservation = isReservationTransaction(tx.type);
    
    if (isReservation) {
      // Show both stock and reserved for reservation transactions
      return (
        <div className="flex flex-col items-center gap-0.5">
          {/* Reserved change */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 w-8 text-right">Rsv:</span>
            <span className="text-xs text-slate-400 tabular-nums">{tx.beforeReserved ?? 0}</span>
            <ArrowRight className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 tabular-nums">{tx.afterReserved ?? 0}</span>
          </div>
          {/* Available (calculated) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 w-8 text-right">Avl:</span>
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
    
    // Standard stock change view
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs text-slate-400 tabular-nums">{tx.beforeQuantity}</span>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {tx.afterQuantity}
        </span>
      </div>
    );
  };

  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <History className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t("admin.inventory.history.title")}
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  {productName} · <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{variantSku}</code>
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Current Stock Summary */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {t("admin.inventory.available")}
              </p>
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">{currentAvailable}</p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {t("admin.inventory.reserved")}
              </p>
              <p className="text-2xl font-bold text-amber-600 tabular-nums">{currentReserved}</p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                {t("admin.inventory.total")}
              </p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                {currentAvailable + currentReserved}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
              <p className="text-sm text-slate-500">{t("common.loading")}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 mx-6 my-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <Package className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">{t("admin.inventory.history.noData")}</p>
              <p className="text-xs text-slate-400 mt-1">
                {t("admin.inventory.history.noDataHint")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent bg-slate-50/50 dark:bg-slate-900/30">
                  <TableHead className="w-[150px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.date")}
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.type")}
                  </TableHead>
                  <TableHead className="text-right w-[80px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.change")}
                  </TableHead>
                  <TableHead className="text-center w-[140px] text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.balance")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t("admin.inventory.history.reference")}
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                      className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      {/* Date */}
                      <TableCell className="py-3">
                        <span className="text-xs font-mono text-slate-500">
                          {formatDate(tx.createdAt)}
                        </span>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline" 
                          className={`gap-1 text-[10px] font-semibold uppercase tracking-wide border-0 ${config.color} ${config.bgColor}`}
                          title={config.description}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>

                      {/* Change */}
                      <TableCell className="py-3 text-right">
                        {renderChangeIndicator(tx)}
                      </TableCell>

                      {/* Balance */}
                      <TableCell className="py-3">
                        {renderBalanceChange(tx)}
                      </TableCell>

                      {/* Reference & Note */}
                      <TableCell className="py-3 max-w-[200px]">
                        {tx.reference && (
                          <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {tx.reference}
                          </code>
                        )}
                        {tx.note && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={tx.note}>
                            {tx.note}
                          </p>
                        )}
                        {!tx.reference && !tx.note && <span className="text-slate-300">—</span>}
                      </TableCell>

                      {/* Performed By */}
                      <TableCell className="py-3">
                        <span className="text-xs text-slate-500 font-medium truncate block max-w-[100px]" title={tx.performedBy}>
                          {tx.performedBy || t("admin.inventory.history.system")}
                        </span>
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
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-slate-500">
                {t("common.pagination.showing", { count: data.length, total: totalElements })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  disabled={page === 0 || isLoading}
                >
                  {t("common.pagination.prev")}
                </Button>
                <span className="text-xs font-medium text-slate-600 min-w-[60px] text-center">
                  {page + 1} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPage(prev => prev + 1)}
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
            <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-2">
                {t("admin.inventory.history.legend")}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(TRANSACTION_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div key={type} className="flex items-center gap-1.5">
                      <Icon className={`h-3 w-3 ${config.color}`} />
                      <span className="text-[10px] text-slate-500">{config.label}: {config.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
