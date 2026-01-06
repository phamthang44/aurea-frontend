"use client";

import * as React from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "type"
  > {
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: boolean;
}

/**
 * CurrencyInput - A smart number input with thousand separators
 * 
 * Features:
 * - Displays numbers with thousand separators (e.g., 1,000,000)
 * - Returns raw number value (integer) to parent via onChange
 * - Supports VND currency formatting
 * - Theme-aware styling using semantic CSS variables
 * - Validation error state support
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, onBlur, error, disabled, ...props }, ref) => {
    const handleValueChange = (values: { floatValue?: number }) => {
      if (onChange) {
        // Return the raw number (integer) to parent
        onChange(values.floatValue);
      }
    };

    // Convert value to number if it's a string
    const numericValue = typeof value === "string" ? parseFloat(value) || undefined : value;

    return (
      <NumericFormat
        getInputRef={(input: HTMLInputElement) => {
          if (ref) {
            if (typeof ref === "function") {
              ref(input);
            } else {
              ref.current = input;
            }
          }
        }}
        value={numericValue}
        onValueChange={handleValueChange}
        onBlur={onBlur}
        thousandSeparator=","
        decimalSeparator="."
        decimalScale={0} // No decimals for currency (VND)
        allowNegative={false}
        disabled={disabled}
        type="text"
        aria-invalid={error}
        className={cn(
          // Base input styles using semantic variables
          "file:text-foreground placeholder:text-muted-foreground",
          "selection:bg-primary selection:text-primary-foreground",
          "dark:bg-input/30 border-input",
          "h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1",
          "text-base shadow-xs transition-[color,box-shadow] outline-none",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          // Focus styles
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          // Error state
          error && "ring-destructive/20 dark:ring-destructive/40 border-destructive",
          className
        )}
        {...(props as Omit<
          React.ComponentProps<"input">,
          "onChange" | "value" | "type" | "defaultValue"
        >)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

