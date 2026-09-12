import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border h-10 w-full min-w-0 rounded-xl border-2 bg-background px-4 py-2 text-base transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-primary/40",
        "focus-visible:border-primary focus-visible:ring-0",
        "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
