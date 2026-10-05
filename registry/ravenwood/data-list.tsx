import * as React from "react"
import { cn } from "cn"

function DataList({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl data-slot="data-list" className={cn("grid", className)} {...props} />
  )
}

function DataListItem({
  className,
  term,
  mono = false,
  children,
}: {
  className?: string
  term: string
  mono?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="data-list-item"
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0",
        className
      )}
    >
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className={cn("text-right text-sm", mono && "font-mono text-xs")}>
        {children}
      </dd>
    </div>
  )
}

export { DataList, DataListItem }
