"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  className?: string;
}

/**
 * FormField component for consistent layout, labels, and error messages
 * in admin forms. Designed to look premium like Shopify/Stripe.
 */
export function FormField({
  label,
  error,
  required,
  children,
  hint,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
          {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </Label>
      </div>
      
      <div className="relative group">
        {children}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-medium text-rose-500 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-400 italic"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
