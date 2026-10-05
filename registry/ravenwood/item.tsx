import * as React from "react"
import { cn } from "cn"

function Item({
  className,
  icon,
  title,
  description,
  meta,
  action,
}: {
  className?: string
  icon?: React.ReactNode
  title: string
  description?: string
  meta?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="item"
      className={cn("flex items-center gap-3 px-2 py-2", className)}
    >
      {icon ? (
        <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{title}</span>
        {description ? (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {meta ? (
        <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
      ) : null}
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  )
}

export { Item }
