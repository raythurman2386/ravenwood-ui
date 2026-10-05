import * as React from "react"
import { cn } from "cn"

function EmptyPanel({
  className,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-panel"
      className={cn("flex flex-col items-start gap-1 px-4 py-6", className)}
      {...props}
    >
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}

export { EmptyPanel }
