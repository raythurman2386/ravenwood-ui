import * as React from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

function HollowInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="hollow-input"
      className={cn(
        "h-10 bg-muted shadow-none",
        "focus-visible:border-ring focus-visible:ring-ring/40",
        className
      )}
      {...props}
    />
  )
}

export { HollowInput }
