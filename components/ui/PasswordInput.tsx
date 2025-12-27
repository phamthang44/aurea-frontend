"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <Label
            htmlFor={id}
            className="text-xs font-light tracking-wider uppercase text-muted-foreground"
          >
            {label}
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
              error && "border-destructive focus:border-destructive",
              className
            )}
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
          {error && (
            <p className="absolute -bottom-5 left-0 text-xs text-destructive font-light">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

