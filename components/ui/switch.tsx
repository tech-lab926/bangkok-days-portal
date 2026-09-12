"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/90 data-[state=unchecked]:bg-input/60 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 dark:data-[state=unchecked]:bg-input/50 group/switch inline-flex shrink-0 items-center rounded-full border-2 border-transparent shadow-md transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.35rem] data-[size=default]:w-10 data-[size=sm]:h-4 data-[size=sm]:w-7 hover:shadow-lg data-[state=checked]:shadow-primary/20",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-all duration-300 shadow-sm group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3.5 data-[state=checked]:translate-x-[calc(100%-4px)] data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
