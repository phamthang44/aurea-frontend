"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface LuxuryInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const LuxuryInput = forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ label, error, className, onBlur, ...props }, ref) => {
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState("");

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      // Validate required fields
      if (props.required && !e.target.value.trim()) {
        setInternalError("This field is required");
      } else {
        setInternalError("");
      }

      // Call parent onBlur if provided
      onBlur?.(e);
    };

    const displayError = error || (touched && internalError);

    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className="text-xs font-light tracking-wider uppercase text-muted-foreground"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent border-0 border-b border-border pb-2 pt-1",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-foreground transition-colors",
              "font-light tracking-wide",
              displayError && "border-red-500 focus:border-red-500",
              className
            )}
            onBlur={handleBlur}
            {...props}
          />
          {displayError && (
            <p className="absolute -bottom-6 left-0 text-xs font-medium bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded text-red-600 dark:text-red-400">
              ⚠ {displayError}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LuxuryInput.displayName = "LuxuryInput";
