'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ variant = 'default', isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || isLoading}
        className={cn(
          'font-light tracking-wide uppercase text-xs',
          'rounded-none border border-border',
          variant === 'default' && 'bg-foreground text-background hover:bg-foreground/90',
          variant === 'outline' && 'bg-transparent hover:bg-accent',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LuxuryButton.displayName = 'LuxuryButton';

