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
        "rounded-2xl border-ring/30 bg-card transition-[border-color] duration-fade ease-enter before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:z-10 before:h-0.5 before:bg-linear-to-r before:from-transparent before:via-ring before:to-transparent",
        "[&_[data-slot=card-description]]:text-moss-foreground",
        className
      )}
      {...props}
    />
  )
}

export { ForestCard }
