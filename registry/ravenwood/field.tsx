import * as React from "react"
import { cn } from "cn"

import { Label } from "@/components/ui/label"

function Field({
  className,
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  className?: string
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="field" className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export { Field }
