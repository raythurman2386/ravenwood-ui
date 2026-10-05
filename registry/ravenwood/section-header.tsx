import * as React from "react"
import { cn } from "cn"

function SectionHeader({
  className,
  title,
  description,
  action,
}: {
  className?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { SectionHeader }
