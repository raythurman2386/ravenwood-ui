import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const statusDotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    status: {
      idle: "bg-muted-foreground",
      running: "bg-primary",
      ok: "bg-moss-foreground",
      warn: "bg-lantern-foreground",
      error: "bg-rust-foreground",
    },
  },
  defaultVariants: {
    status: "idle",
  },
})

type StatusDotStatus = NonNullable<
  VariantProps<typeof statusDotVariants>["status"]
>

function StatusDot({
  className,
  status = "idle",
  label,
}: {
  className?: string
  status?: StatusDotStatus
  label?: string
}) {
  return (
    <span
      data-slot="status-dot"
      data-status={status}
      className={cn("inline-flex items-center gap-2 text-sm", className)}
    >
      <span aria-hidden="true" className={statusDotVariants({ status })} />
      {label ? <span>{label}</span> : <span className="sr-only">{status}</span>}
    </span>
  )
}

export { StatusDot, statusDotVariants, type StatusDotStatus }
