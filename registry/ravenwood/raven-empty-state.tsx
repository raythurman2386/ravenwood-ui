import * as React from "react"
import { cn } from "cn"

import { RavenMark } from "./raven-mark"

function RavenEmptyState({
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
      data-slot="raven-empty-state"
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-14 text-center",
        className
      )}
      {...props}
    >
      <RavenMark wordmark={false} className="text-3xl text-muted-foreground" />
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}

export { RavenEmptyState }
