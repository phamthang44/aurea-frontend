'use client';

import React from 'react';
import { AlertCircle, XCircle, RefreshCcw, Download, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorItem {
  id?: string | number;
  label?: string;
  message: string;
}

interface AdminErrorDisplayProps {
  title: string;
  description?: string;
  items?: ErrorItem[];
  onRetry?: () => void;
  onClose?: () => void;
  onDownloadReport?: () => void;
  className?: string;
  variant?: 'error' | 'warning';
}

export function AdminErrorDisplay({
  title,
  description,
  items,
  onRetry,
  onClose,
  onDownloadReport,
  className,
  variant = 'error'
}: AdminErrorDisplayProps) {
  const isError = variant === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative w-full rounded-2xl border p-6 flex items-start gap-4 overflow-hidden",
        isError 
          ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30" 
          : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
        className
      )}
    >
      {/* Visual Accent */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        isError ? "bg-red-500" : "bg-amber-500"
      )} />

      {/* Icon */}
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
        isError ? "bg-red-100 dark:bg-red-900/40 text-red-600" : "bg-amber-100 dark:bg-amber-900/40 text-amber-600"
      )}>
        {isError ? <XCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h3 className={cn(
            "text-lg font-semibold leading-none",
            isError ? "text-red-900 dark:text-red-400" : "text-amber-900 dark:text-amber-400"
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "text-sm font-light leading-relaxed",
              isError ? "text-red-700/80 dark:text-red-400/60" : "text-amber-700/80 dark:text-amber-400/60"
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Affected Items */}
        {items && items.length > 0 && (
          <div className={cn(
            "rounded-xl border p-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar bg-white/40 dark:bg-black/20",
            isError ? "border-red-200/50 dark:border-red-900/20" : "border-amber-200/50 dark:border-amber-900/20"
          )}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Affected Items & Details</p>
            {items.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                  isError ? "bg-red-400" : "bg-amber-400"
                )} />
                <div className="flex-1 min-w-0">
                  {item.label && <span className="font-bold mr-2">{item.label}:</span>}
                  <span className="font-light opacity-80">{item.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onRetry && (
            <Button 
              size="sm" 
              onClick={onRetry}
              className={cn(
                "rounded-lg px-4 h-9 font-medium shadow-sm",
                isError 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              )}
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-2" />
              Try Again
            </Button>
          )}
          {onDownloadReport && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onDownloadReport}
              className={cn(
                "rounded-lg px-4 h-9 font-light border-2",
                isError 
                  ? "border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100/50" 
                  : "border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50"
              )}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Download Report
            </Button>
          )}
          {!onRetry && !onDownloadReport && isError && (
             <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/60">
                Action required to continue
             </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
            isError ? "hover:bg-red-200/50 dark:hover:bg-red-900/30 text-red-600" : "hover:bg-amber-200/50 dark:hover:bg-amber-900/30 text-amber-600"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
