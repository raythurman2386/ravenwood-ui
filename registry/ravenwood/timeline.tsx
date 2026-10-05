import * as React from "react"
import { cn } from "cn"

import { StatusDot, type StatusDotStatus } from "./status-dot"

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      className={cn("grid [&>li:last-child_.timeline-line]:hidden", className)}
      {...props}
    />
  )
}

function TimelineItem({
  className,
  status = "idle",
  title,
  meta,
  children,
}: {
  className?: string
  status?: StatusDotStatus
  title: string
  meta?: string
  children?: React.ReactNode
}) {
  return (
    <li
      data-slot="timeline-item"
      className={cn("grid grid-cols-[1rem_1fr] gap-x-3", className)}
    >
      <div className="flex flex-col items-center">
        <StatusDot status={status} className="mt-1" />
        <span className="timeline-line my-1 w-px flex-1 bg-border" />
      </div>
      <div className="min-w-0 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-medium">{title}</p>
          {meta ? (
            <p className="font-mono text-xs text-muted-foreground">{meta}</p>
          ) : null}
        </div>
        {children ? (
          <div className="mt-1 text-sm text-muted-foreground">{children}</div>
        ) : null}
      </div>
    </li>
  )
}

export { Timeline, TimelineItem }
