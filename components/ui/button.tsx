import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const baseButton =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium " +
  "transition-all duration-300 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "cursor-pointer active:scale-95";

const buttonVariants = cva(baseButton, {
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground " +
        "hover:bg-primary/90 active:bg-primary/80",

      destructive:
        "bg-destructive text-white " +
        "hover:bg-destructive/90 active:bg-destructive/80",

      outline:
        "border border-input bg-white text-foreground " +
        "hover:bg-muted active:bg-muted/80 " +
        "dark:bg-zinc-900 dark:border-zinc-700",

      secondary:
        "bg-secondary text-secondary-foreground " +
        "hover:bg-secondary/90 active:bg-secondary/80",

      ghost:
        "bg-transparent text-foreground " + "hover:bg-muted active:bg-muted/80",

      link: "bg-transparent text-primary underline-offset-4 hover:underline",
    },

    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6",
      icon: "h-9 w-9",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
