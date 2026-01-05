"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, onBlur, ...props }, ref) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState("");

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      // Validate required fields
      if (props.required && !e.target.value.trim()) {
        try {
          const translated = t("validation.passwordRequired");
          // Only set if translation is valid (not the key itself)
          setInternalError(translated && translated !== "validation.passwordRequired" ? translated : t("validation.fieldRequired"));
        } catch {
          setInternalError(t("validation.fieldRequired"));
        }
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
            htmlFor={id}
            className="text-xs font-light tracking-wider uppercase text-muted-foreground"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            className={cn(
              "w-full bg-transparent border-0 border-b border-border pb-2 pt-1 pr-8",
              "text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-foreground transition-colors",
              "font-light tracking-wide",
              displayError && "border-red-500 focus:border-red-500",
              className
            )}
            onBlur={handleBlur}
            {...props}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {displayError && (
            <p className="absolute -bottom-6 left-0 text-xs font-light bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded text-red-600 dark:text-red-400">
              ⚠ {displayError}
            </p>
          )}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
