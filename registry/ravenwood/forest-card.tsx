import * as React from "react"
import { cn } from "cn"

import { Card } from "@/components/ui/card"

function ForestCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="forest-card"
      className={cn(
        "duration-fade rounded-2xl border-border bg-card transition-[border-color] ease-enter before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:z-10 before:h-px before:bg-linear-to-r before:from-transparent before:via-ring before:to-transparent",
        "[&_[data-slot=card-description]]:text-moss-foreground",
        className
      )}
      {...props}
    />
  )
}

export { ForestCard }
