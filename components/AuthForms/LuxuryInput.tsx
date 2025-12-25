'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface LuxuryInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const LuxuryInput = forwardRef<HTMLInputElement, LuxuryInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className="text-xs font-light tracking-wider uppercase text-muted-foreground"
          >
            {label}
          </Label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full bg-transparent border-0 border-b border-border pb-2 pt-1',
              'text-foreground placeholder:text-muted-foreground/50',
              'focus:outline-none focus:border-foreground transition-colors',
              'font-light tracking-wide',
              error && 'border-destructive focus:border-destructive',
              className
            )}
            {...props}
          />
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

LuxuryInput.displayName = 'LuxuryInput';

