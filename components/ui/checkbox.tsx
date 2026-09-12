"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input/60 dark:bg-input/30 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:to-primary/90 data-[state=checked]:text-primary-foreground dark:data-[state=checked]:from-primary dark:data-[state=checked]:to-primary/80 data-[state=checked]:border-primary data-[state=checked]:shadow-md data-[state=checked]:shadow-primary/25 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-lg border-2 shadow-sm transition-all duration-300 outline-none hover:border-input hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-all duration-200 scale-0 data-[state=checked]:scale-100"
      >
        <CheckIcon className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
