import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 touch-manipulation items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium tracking-[0.01em] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-fade ease-enter outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.98] active:duration-press active:ease-press motion-reduce:active:scale-100 disabled:pointer-events-none disabled:scale-100 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[hsl(158_34%_18%)] bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_hsl(40_50%_76%/0.5),inset_0_-2px_0_0_hsl(158_42%_12%/0.7)] hover:border-ring/60 hover:bg-primary/92",
        outline:
          "border-border bg-card/80 text-foreground shadow-[inset_0_1px_0_0_hsl(40_40%_82%/0.14)] hover:border-ring/45 hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_0_hsl(40_36%_78%/0.16),inset_0_-2px_0_0_hsl(120_12%_8%/0.35)] hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive:
          "border-rust-foreground/30 bg-rust text-rust-foreground shadow-[inset_0_1px_0_0_hsl(20_46%_88%/0.45),inset_0_-2px_0_0_hsl(16_40%_18%/0.55)] hover:bg-rust/85 focus-visible:border-destructive/50 focus-visible:ring-destructive/35",
        lantern:
          "border-ring/60 bg-lantern text-lantern-foreground shadow-[inset_0_1px_0_0_hsl(40_62%_78%/0.55),inset_0_-2px_0_0_hsl(32_30%_18%/0.45)] hover:border-ring hover:bg-lantern/85",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
