import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input/60 placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-xl border-2 bg-background/50 backdrop-blur-sm px-4 py-3 text-base shadow-sm transition-all duration-300 outline-none hover:border-input hover:shadow-md focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
