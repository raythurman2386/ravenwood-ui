import * as React from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

function HollowInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="hollow-input"
      className={cn(
        "h-10 bg-[hsl(40_22%_88%)] shadow-[inset_0_2px_0_0_hsl(30_14%_36%/0.16),inset_0_6px_8px_-4px_hsl(30_18%_28%/0.18)] dark:bg-[hsl(110_16%_2.4%)] dark:shadow-[inset_0_3px_0_0_hsl(110_14%_1%/0.95),inset_0_12px_16px_-10px_hsl(0_0%_0%/0.9)]",
        "focus-visible:border-ring focus-visible:ring-ring/40",
        className
      )}
      {...props}
    />
  )
}

export { HollowInput }
