"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { springs } from "@/lib/motion"

const TabsIndicatorContext = React.createContext<{
  layoutId: string
  variant: "default" | "line"
} | null>(null)

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit max-w-full items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "h-9 overflow-x-auto overflow-y-hidden rounded-lg bg-muted p-[3px]",
        line: "h-auto gap-1 overflow-visible rounded-none bg-transparent pb-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const layoutId = React.useId()

  return (
    <TabsIndicatorContext.Provider value={{ layoutId, variant: variant ?? "default" }}>
      <LayoutGroup id={layoutId}>
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          className={cn(tabsListVariants({ variant }), className)}
          {...props}
        />
      </LayoutGroup>
    </TabsIndicatorContext.Provider>
  )
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = React.useContext(TabsIndicatorContext)
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLButtonElement>(null)
  const [active, setActive] = React.useState(false)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () =>
      setActive(
        el.hasAttribute("data-active") || el.getAttribute("data-state") === "active"
      )
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-active", "data-state"],
    })
    return () => observer.disconnect()
  }, [])

  const pillClass =
    ctx?.variant === "line"
      ? "absolute inset-x-0 bottom-0 h-0.5 bg-ring"
      : "absolute inset-0 rounded-md bg-background shadow-sm dark:bg-input/30"

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-[color] duration-fade ease-enter group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ctx?.variant === "line" ? "h-8" : "h-[calc(100%-1px)]",
        "bg-transparent data-active:bg-transparent data-active:text-foreground dark:data-active:bg-transparent",
        className
      )}
      {...props}
    >
      {active && ctx ? (
        reduce ? (
          <span className={cn("z-0", pillClass)} />
        ) : (
          <motion.span
            layoutId={`${ctx.layoutId}-indicator`}
            className={cn("z-0", pillClass)}
            transition={springs.ui}
          />
        )
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none duration-[140ms] ease-enter data-active:animate-in data-active:fade-in-0 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
