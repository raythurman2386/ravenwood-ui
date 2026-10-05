"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { XIcon } from "lucide-react"

const bannerVariants = cva("flex w-full items-center gap-3 px-4 py-2 text-sm", {
  variants: {
    tone: {
      moss: "bg-moss text-moss-foreground",
      lantern: "bg-lantern text-lantern-foreground",
      rust: "bg-rust text-rust-foreground",
    },
  },
  defaultVariants: {
    tone: "moss",
  },
})

function Banner({
  className,
  tone = "moss",
  children,
  onDismiss,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    onDismiss?: () => void
  }) {
  const [open, setOpen] = React.useState(true)
  if (!open) return null

  return (
    <div
      data-slot="banner"
      data-tone={tone}
      className={cn(bannerVariants({ tone }), className)}
      {...props}
    >
      <p className="min-w-0 flex-1 truncate">{children}</p>
      <button
        type="button"
        aria-label="Dismiss"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => {
          setOpen(false)
          onDismiss?.()
        }}
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

export { Banner, bannerVariants }
