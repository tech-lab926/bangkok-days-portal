import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground [a&]:hover:from-primary/90 [a&]:hover:to-primary/80 [a&]:hover:shadow-md [a&]:hover:scale-105",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground [a&]:hover:from-secondary/90 [a&]:hover:to-secondary/80 [a&]:hover:shadow-md",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-white [a&]:hover:from-destructive/90 [a&]:hover:to-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:from-destructive/80 dark:to-destructive/70 [a&]:hover:shadow-md",
        outline:
          "border-2 border-border/60 text-foreground bg-background/50 backdrop-blur-sm [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:border-border [a&]:hover:shadow-md",
        ghost: "bg-transparent [a&]:hover:bg-accent/70 [a&]:hover:text-accent-foreground [a&]:hover:shadow-sm",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
