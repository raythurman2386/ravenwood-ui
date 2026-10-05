import * as React from "react"
import { cn } from "cn"

function Progress({
  className,
  value,
  max = 100,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  max?: number
  variant?: "default" | "lantern"
}) {
  const safeMax = max > 0 ? max : 100
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full",
          variant === "lantern" ? "bg-lantern-foreground" : "bg-primary"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export { Progress }
