import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-border bg-[hsl(40_28%_91%)] px-3 py-2 text-base shadow-[inset_0_2px_0_0_hsl(30_16%_40%/0.12),inset_0_3px_6px_hsl(30_20%_30%/0.12)] transition-[border-color,box-shadow] duration-fade ease-enter outline-none placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/45 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 md:text-sm dark:bg-[hsl(110_14%_3.2%)] dark:shadow-[inset_0_2px_0_0_hsl(110_14%_2%/0.9),inset_0_8px_14px_-8px_hsl(0_0%_0%/0.8)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
