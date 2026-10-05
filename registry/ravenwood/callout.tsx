import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const calloutVariants = cva("flex gap-3 border-l-2 px-3 py-2 text-sm", {
  variants: {
    variant: {
      note: "border-l-moss-foreground",
      warning: "border-l-lantern-foreground",
      danger: "border-l-rust-foreground",
    },
  },
  defaultVariants: {
    variant: "note",
  },
})

function Callout({
  className,
  variant = "note",
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof calloutVariants> & {
    icon?: React.ReactNode
  }) {
  return (
    <div
      data-slot="callout"
      data-variant={variant}
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      {icon ? <span className="mt-0.5 [&_svg]:size-4">{icon}</span> : null}
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export { Callout, calloutVariants }
