import * as React from "react"
import { cn } from "cn"

function Metric({
  className,
  label,
  value,
  delta,
  hint,
}: {
  className?: string
  label: string
  value: React.ReactNode
  delta?: React.ReactNode
  hint?: string
}) {
  return (
    <div data-slot="metric" className={cn("grid gap-1", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl leading-none">{value}</p>
      {delta ? <p className="text-sm">{delta}</p> : null}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export { Metric }
