import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const groveAlertVariants = cva(
  "relative grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-xl border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        moss: "border-moss-foreground/25 bg-moss text-moss-foreground",
        lantern: "border-ring/40 bg-lantern text-lantern-foreground",
        rust: "border-destructive/35 bg-rust text-rust-foreground",
      },
    },
    defaultVariants: {
      variant: "moss",
    },
  }
)

function GroveAlert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof groveAlertVariants>) {
  const resolved = variant ?? "moss"

  return (
    <div
      role={resolved === "rust" ? "alert" : "status"}
      data-slot="grove-alert"
      data-variant={resolved}
      className={cn(groveAlertVariants({ variant: resolved }), className)}
      {...props}
    />
  )
}

function GroveAlertIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grove-alert-icon"
      className={cn("mt-0.5 [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function GroveAlertTitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="grove-alert-title"
      className={cn("font-serif text-base leading-tight tracking-tight", className)}
      {...props}
    />
  )
}

function GroveAlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grove-alert-description"
      className={cn("col-start-2 text-sm opacity-90", className)}
      {...props}
    />
  )
}

export {
  GroveAlert,
  GroveAlertIcon,
  GroveAlertTitle,
  GroveAlertDescription,
  groveAlertVariants,
}
