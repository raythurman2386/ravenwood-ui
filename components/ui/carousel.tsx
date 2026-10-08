"use client"

import * as React from "react"
import { cn } from "cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import Fade from "embla-carousel-fade"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselBreakpoint = "base" | "sm" | "md" | "lg" | "xl"
type CarouselItemsPerView = number | Partial<Record<CarouselBreakpoint, number>>
type CarouselAutoplay =
  | boolean
  | {
      /** Milliseconds between slides. Default 5000. */
      delay?: number
      /** Start rotating on mount. Default true. */
      playOnInit?: boolean
    }

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  /** Slide (default) or cross-fade. Fade always shows one item per view. */
  transition?: "slide" | "fade"
  /** Items visible at once, as a number or per breakpoint. */
  itemsPerView?: CarouselItemsPerView
  /** Opt-in rotation with a pause/play control. Never runs under reduced motion. */
  autoplay?: CarouselAutoplay
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  slideCount: number
  visibleSlides: ReadonlySet<number>
  rotating: boolean
  hasItemsPerView: boolean
} & Omit<CarouselProps, "setApi" | "plugins" | "autoplay" | "itemsPerView">

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const BREAKPOINTS: CarouselBreakpoint[] = ["base", "sm", "md", "lg", "xl"]

/** Fill missing breakpoints forward so every CSS var has a value. */
function resolveItemsPerView(itemsPerView: CarouselItemsPerView | undefined) {
  if (itemsPerView === undefined) {
    return null
  }
  const source =
    typeof itemsPerView === "number" ? { base: itemsPerView } : itemsPerView
  const resolved = {} as Record<CarouselBreakpoint, number>
  let last = 1
  for (const breakpoint of BREAKPOINTS) {
    const value = source[breakpoint]
    if (typeof value === "number" && value > 0) {
      last = value
    }
    resolved[breakpoint] = last
  }
  return resolved
}

function warn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[Carousel] ${message}`)
  }
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  transition = "slide",
  itemsPerView,
  autoplay,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion(rootRef)
  const fade = transition === "fade"

  const userPluginNames = React.useMemo(
    () => new Set((plugins ?? []).map((plugin) => plugin.name)),
    [plugins]
  )
  const autoplayConfig = autoplay
    ? typeof autoplay === "object"
      ? autoplay
      : {}
    : null
  const autoplayDelay = autoplayConfig?.delay ?? 5000
  const playOnInit = autoplayConfig?.playOnInit ?? true
  const managesAutoplay = !!autoplayConfig && !userPluginNames.has("autoplay")
  const managesFade = fade && !userPluginNames.has("fade")

  let perView = resolveItemsPerView(itemsPerView)
  const fadeDropsPerView =
    fade && !!perView && Object.values(perView).some((value) => value > 1)
  if (fadeDropsPerView) {
    perView = null
  }
  const multiPerView = !!perView && Object.values(perView).some((v) => v > 1)

  const emblaPlugins = React.useMemo(() => {
    const list = [...(plugins ?? [])]
    if (managesFade) {
      list.push(Fade())
    }
    if (managesAutoplay) {
      // Rotation is driven below (hover, focus, reduced motion, the control),
      // so the plugin's own stop rules are off.
      list.push(
        Autoplay({
          delay: autoplayDelay,
          playOnInit: false,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
          stopOnFocusIn: false,
        })
      )
    }
    return list
  }, [plugins, managesFade, managesAutoplay, autoplayDelay])

  const [carouselRef, api] = useEmblaCarousel(
    {
      // Embla's duration is a spring constant, not ms. 15 moves 99% of the
      // way in about 300ms with under 1.2% overshoot. Lower is faster but
      // overshoots visibly (12: about 217ms, 3.3%).
      duration: 15,
      // A slide counts as visible (and leaves inert) once half of it shows.
      inViewThreshold: 0.5,
      ...(multiPerView ? { align: "start", slidesToScroll: "auto" } : {}),
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    emblaPlugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [slideCount, setSlideCount] = React.useState(0)
  const [visibleSlides, setVisibleSlides] = React.useState<ReadonlySet<number>>(
    () => new Set()
  )

  // Rotation: what the user asked for, minus temporary pauses.
  const [rotationOn, setRotationOn] = React.useState(playOnInit)
  const [hovered, setHovered] = React.useState(false)
  const autoplayAvailable = managesAutoplay && !reducedMotion
  const rotating = autoplayAvailable && rotationOn && !hovered

  const onSelect = React.useCallback(
    (api: CarouselApi) => {
      if (!api) return
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setSlideCount(api.slideNodes().length)
      setVisibleSlides(
        new Set(fade ? [api.selectedScrollSnap()] : api.slidesInView())
      )
    },
    [fade]
  )

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev(reducedMotion)
  }, [api, reducedMotion])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext(reducedMotion)
  }, [api, reducedMotion])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isTypingTarget(event.target)) {
        return
      }
      const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"
      if (event.key === prevKey) {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === nextKey) {
        event.preventDefault()
        scrollNext()
      }
    },
    [orientation, scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    // Embla is already initialised here; sync on the next frame.
    const frame = requestAnimationFrame(() => onSelect(api))
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    api.on("slidesInView", onSelect)

    return () => {
      cancelAnimationFrame(frame)
      api.off("reInit", onSelect)
      api.off("select", onSelect)
      api.off("slidesInView", onSelect)
    }
  }, [api, onSelect])

  // Drive the Autoplay plugin from our rotation state.
  React.useEffect(() => {
    const plugin = api?.plugins().autoplay
    if (!managesAutoplay || !plugin) return
    if (rotating) {
      plugin.play()
    } else {
      plugin.stop()
    }
  }, [api, managesAutoplay, rotating])

  // Dragging is an explicit interaction: stop rotating until the user asks.
  React.useEffect(() => {
    if (!api || !managesAutoplay) return
    const stop = () => setRotationOn(false)
    api.on("pointerDown", stop)
    return () => {
      api.off("pointerDown", stop)
    }
  }, [api, managesAutoplay])

  const duplicateAutoplay = !!autoplayConfig && userPluginNames.has("autoplay")
  const duplicateFade = fade && userPluginNames.has("fade")
  React.useEffect(() => {
    if (duplicateAutoplay) {
      warn(
        "`autoplay` is set and `plugins` already contains an Autoplay plugin. The prop is ignored."
      )
    }
    if (duplicateFade) {
      warn(
        '`transition="fade"` is set and `plugins` already contains a Fade plugin. The prop is ignored.'
      )
    }
    if (fadeDropsPerView) {
      warn(
        '`transition="fade"` shows one item per view. `itemsPerView` is ignored.'
      )
    }
  }, [duplicateAutoplay, duplicateFade, fadeDropsPerView])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (
      !root.hasAttribute("aria-label") &&
      !root.hasAttribute("aria-labelledby")
    ) {
      warn("Give the carousel an `aria-label` or `aria-labelledby`.")
    }
  }, [])

  const perViewStyle = perView
    ? (Object.fromEntries(
        BREAKPOINTS.map((breakpoint) => [
          `--carousel-per-view-${breakpoint}`,
          perView[breakpoint],
        ])
      ) as React.CSSProperties)
    : undefined

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        transition,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        slideCount,
        visibleSlides,
        rotating,
        hasItemsPerView: !!perView,
      }}
    >
      <div
        ref={rootRef}
        onKeyDownCapture={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={(event) => {
          // APG: focus entering the carousel stops rotation for good. The
          // rotation control itself is exempt so it can restart it.
          const target = event.target as HTMLElement
          if (
            managesAutoplay &&
            !target.closest('[data-slot="carousel-autoplay-toggle"]')
          ) {
            setRotationOn(false)
          }
        }}
        className={cn(
          "relative",
          perView &&
            "[--carousel-per-view:var(--carousel-per-view-base)] sm:[--carousel-per-view:var(--carousel-per-view-sm)] md:[--carousel-per-view:var(--carousel-per-view-md)] lg:[--carousel-per-view:var(--carousel-per-view-lg)] xl:[--carousel-per-view:var(--carousel-per-view-xl)]",
          className
        )}
        style={{ ...perViewStyle, ...style }}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-orientation={orientation}
        data-transition={transition}
        {...props}
      >
        {autoplayAvailable ? (
          <CarouselAutoplayToggle
            rotating={rotationOn}
            onToggle={() => setRotationOn((value) => !value)}
          />
        ) : null}
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselAutoplayToggle({
  rotating,
  onToggle,
}: {
  rotating: boolean
  onToggle: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      data-slot="carousel-autoplay-toggle"
      className="absolute top-2 right-2 z-10 rounded-full bg-background/80"
      onClick={onToggle}
    >
      {rotating ? <PauseIcon /> : <PlayIcon />}
      <span className="sr-only">
        {rotating ? "Stop slide rotation" : "Start slide rotation"}
      </span>
    </Button>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation, rotating } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        aria-live={rotating ? "off" : "polite"}
        aria-atomic="false"
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { api, orientation, slideCount, visibleSlides, hasItemsPerView } =
    useCarousel()
  const ref = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(-1)

  React.useEffect(() => {
    if (!api) return
    const update = () => {
      setIndex(ref.current ? api.slideNodes().indexOf(ref.current) : -1)
    }
    const frame = requestAnimationFrame(update)
    api.on("reInit", update)
    return () => {
      cancelAnimationFrame(frame)
      api.off("reInit", update)
    }
  }, [api])

  const known = index >= 0 && slideCount > 0
  const hidden = known && visibleSlides.size > 0 && !visibleSlides.has(index)
  const hasOwnLabel =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={
        hasOwnLabel || !known ? undefined : `${index + 1} of ${slideCount}`
      }
      inert={hidden || undefined}
      data-slot="carousel-item"
      data-visible={known ? !hidden : undefined}
      className={cn(
        "min-w-0 shrink-0 grow-0",
        hasItemsPerView
          ? "basis-[calc(100%/var(--carousel-per-view))]"
          : "basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      type="button"
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50",
        orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      // aria-disabled, not disabled: focus stays on the button at the ends.
      aria-disabled={!canScrollPrev}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && canScrollPrev) scrollPrev()
      }}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      type="button"
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50",
        orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      aria-disabled={!canScrollNext}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && canScrollNext) scrollNext()
      }}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  type CarouselOptions,
  type CarouselPlugin,
  type CarouselItemsPerView,
  type CarouselAutoplay,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
