"use client"

/*
 * Map, vendored from mapcn and owned by Ravenwood UI.
 *
 * Upstream: https://github.com/AnmolSaini16/mapcn
 * Commit:   d160bd767bc6388618720c6038a4dd9948c97362 (src/registry/map.tsx)
 *
 * Ravenwood changes: Ravenwood tokens instead of hardcoded colors (any color
 * prop accepts `var(--token)`), OpenFreeMap default basemaps, a self-hosted
 * worker instead of unpkg, markers that render a real <button> with an
 * accessible name, popups that take focus and close on Escape, reduced-motion
 * camera moves, a static skeleton loader, and a scale control.
 *
 * MIT License
 *
 * Copyright (c) 2025 Anmoldeep Singh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as MapLibreGL from "maplibre-gl"
import type { PopupOptions, MarkerOptions } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type * as GeoJSON from "geojson"
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"
import { X, Minus, Plus, Locate, Maximize, Loader2 } from "lucide-react"
import { cn } from "cn"

import { Skeleton } from "@/components/ui/skeleton"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Where `scripts/copy-maplibre-worker.mjs` puts the worker. MapLibre 6 needs a
 * worker URL under a bundler; Ravenwood serves it from `public/` instead of a
 * CDN. A `setWorkerUrl()` call you make yourself wins over this default.
 */
const DEFAULT_WORKER_URL = "/maplibre/maplibre-gl-worker.mjs"

function ensureWorkerUrl(workerUrl?: string) {
  if (workerUrl) {
    MapLibreGL.setWorkerUrl(workerUrl)
  } else if (!MapLibreGL.getWorkerUrl()) {
    MapLibreGL.setWorkerUrl(DEFAULT_WORKER_URL)
  }
}

/**
 * OpenFreeMap: no key, no request limit. CARTO is opt-in through `styles`
 * (see the docs for its terms and key).
 */
const defaultStyles = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/positron",
}

/** Camera moves use the `layout` motion intent (220ms) and jump when reduced. */
const CAMERA_DURATION = 220

/** Keep a ref pointed at the latest value without writing it during render. */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

/**
 * Resolve `var(--token)` colors (anywhere in a paint value, including inside
 * expressions) with a resolver from `useMap().resolveColor`.
 */
function resolvePaintValue<T>(
  value: T,
  resolveColor: (c: string) => string
): T {
  if (typeof value === "string") return resolveColor(value) as T
  if (Array.isArray(value)) {
    return value.map((entry) => resolvePaintValue(entry, resolveColor)) as T
  }
  return value
}

function resolvePaint<T extends Record<string, unknown>>(
  paint: T,
  resolveColor: (c: string) => string
): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(paint)) {
    out[key] = resolvePaintValue(value, resolveColor)
  }
  return out as T
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusFirst(panel: HTMLElement | null) {
  if (!panel) return
  const target = panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel
  target.focus({ preventScroll: true })
}

function warn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[Map] ${message}`)
  }
}

// A tile-less, dependency-free style with a transparent background. Use it for
// data visualizations (choropleths, world arcs, dot maps) where you draw your
// own layers and don't need a street basemap. The easiest way to opt in is the
// `blank` prop:
//   <Map blank>...</Map>
// The transparent background lets the themed container show through.
const blankMapStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "rgba(0, 0, 0, 0)" },
    },
  ],
}

// Prevent equivalent inline style objects from triggering a full map style reload.
function useStableValue<T>(value: T): T {
  const key = useMemo(() => JSON.stringify(value) ?? "", [value])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [key])
}

function mergeHoverPaint<T extends Record<string, unknown>>(
  paint: T,
  hoverPaint: T | undefined
): T {
  if (!hoverPaint) return paint
  const merged: Record<string, unknown> = { ...paint }
  for (const [key, hoverValue] of Object.entries(hoverPaint)) {
    if (hoverValue === undefined) continue
    const baseValue = merged[key]
    merged[key] =
      baseValue === undefined
        ? hoverValue
        : [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            hoverValue,
            baseValue,
          ]
  }
  return merged as T
}

type Theme = "light" | "dark"

// Check the document for an explicit theme (works with next-themes, etc.).
// Covers both `attribute="class"` (the default) and `attribute="data-theme"`.
function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null
  const root = document.documentElement
  if (root.classList.contains("dark")) return "dark"
  if (root.classList.contains("light")) return "light"
  const dataTheme = root.dataset.theme
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme
  return null
}

// Get system preference
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(
    () => getDocumentTheme() ?? getSystemTheme()
  )

  useEffect(() => {
    if (themeProp) return // Skip detection if theme is provided via prop

    // Watch for document theme changes (e.g., next-themes toggling the class
    // or the data-theme attribute).
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme()
      if (docTheme) {
        setDetectedTheme(docTheme)
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    // Also watch for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only use system preference if no document class is set
      if (!getDocumentTheme()) {
        setDetectedTheme(e.matches ? "dark" : "light")
      }
    }
    mediaQuery.addEventListener("change", handleSystemChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleSystemChange)
    }
  }, [themeProp])

  return themeProp ?? detectedTheme
}

type MapContextValue = {
  map: MapLibreGL.Map | null
  isLoaded: boolean
  resolvedTheme: Theme
  /** True when the OS or a `.motion-reduce` ancestor asks for less motion. */
  reducedMotion: boolean
  /** Turns `var(--token)` colors into values MapLibre can paint. */
  resolveColor: (value: string) => string
}

const MapContext = createContext<MapContextValue | null>(null)

function useMap() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error("useMap must be used within a Map component")
  }
  return context
}

/** Map viewport state */
type MapViewport = {
  /** Center coordinates [longitude, latitude] */
  center: [number, number]
  /** Zoom level */
  zoom: number
  /** Bearing (rotation) in degrees */
  bearing: number
  /** Pitch (tilt) in degrees */
  pitch: number
}

type MapStyleOption = string | MapLibreGL.StyleSpecification

type MapRef = MapLibreGL.Map

type MapProps = {
  children?: ReactNode
  /** Additional CSS classes for the map container */
  className?: string
  /** Accessible name for the map region (default: "Map") */
  "aria-label"?: string
  /**
   * Theme for the map. If not provided, follows `.dark` / `.light` on <html>
   * (next-themes) and falls back to the system preference.
   */
  theme?: Theme
  /** Custom map styles for light and dark themes. Overrides the OpenFreeMap defaults. */
  styles?: {
    light?: MapStyleOption
    dark?: MapStyleOption
  }
  /**
   * Use a transparent, tile-less basemap instead of the default street
   * basemap: a blank canvas. Used alone it renders nothing; add your own
   * layers on top (`<MapGeoJSON>`, `<MapArc>`, markers, etc.). Ideal for data
   * visualizations (choropleths, arcs, dot maps).
   * Ignored when an explicit `styles` prop is provided.
   */
  blank?: boolean
  /** Map projection type. Use `{ type: "globe" }` for 3D globe view. */
  projection?: MapLibreGL.ProjectionSpecification
  /**
   * Controlled viewport. When provided with onViewportChange,
   * the map becomes controlled and viewport is driven by this prop.
   */
  viewport?: Partial<MapViewport>
  /**
   * Callback fired continuously as the viewport changes (pan, zoom, rotate, pitch).
   * Can be used standalone to observe changes, or with `viewport` prop
   * to enable controlled mode where the map viewport is driven by your state.
   */
  onViewportChange?: (viewport: MapViewport) => void
  /** Show a loading scrim on the map (e.g. while your data loads) */
  loading?: boolean
  /**
   * Same-origin URL of `maplibre-gl-worker.mjs`. Defaults to
   * `/maplibre/maplibre-gl-worker.mjs`, which `scripts/copy-maplibre-worker.mjs`
   * writes into `public/`. Ignored if you already called `setWorkerUrl()`.
   */
  workerUrl?: string
} & Omit<MapLibreGL.MapOptions, "container" | "style">

function DefaultLoader({ overlay }: { overlay: boolean }) {
  // Static, not pulsing. The skeleton shimmer stops under reduced motion.
  return overlay ? (
    <div aria-hidden className="absolute inset-0 z-10 bg-background/40" />
  ) : (
    <Skeleton aria-hidden className="absolute inset-0 z-10 rounded-none" />
  )
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter()
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    className,
    "aria-label": ariaLabel = "Map",
    theme: themeProp,
    styles,
    blank = false,
    projection,
    viewport,
    onViewportChange,
    loading = false,
    workerUrl,
    ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const [pendingStyle, setPendingStyle] = useState<MapStyleOption | null>(null)
  const currentStyleRef = useRef<MapStyleOption | null>(null)
  const styleSwapInFlightRef = useRef(false)
  const internalUpdateRef = useRef(false)
  const resolvedTheme = useResolvedTheme(themeProp)
  const reducedMotion = useReducedMotion(containerRef)

  const isControlled = viewport !== undefined && onViewportChange !== undefined

  const onViewportChangeRef = useLatest(onViewportChange)

  const stableStyles = useStableValue(styles)

  const mapStyles = useMemo(() => {
    // Explicit styles win. Otherwise `blank` opts into the transparent
    // tile-less basemap; with neither, fall back to the OpenFreeMap defaults.
    if (stableStyles) {
      return {
        dark: stableStyles.dark ?? defaultStyles.dark,
        light: stableStyles.light ?? defaultStyles.light,
      }
    }
    if (blank) {
      return { dark: blankMapStyle, light: blankMapStyle }
    }
    return defaultStyles
  }, [stableStyles, blank])

  // Expose the map instance to the parent component
  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance])

  // Initialize the map
  useEffect(() => {
    if (!containerRef.current) return

    ensureWorkerUrl(workerUrl)

    const initialStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light
    currentStyleRef.current = initialStyle

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: {
        compact: true,
      },
      ...props,
      locale: {
        "Map.Title": `${ariaLabel}. Arrow keys pan, plus and minus zoom.`,
        ...props.locale,
      },
      ...viewport,
    })

    const styleLoadHandler = () => {
      styleSwapInFlightRef.current = false
      setIsStyleLoaded(true)
    }
    const loadHandler = () => setIsLoaded(true)

    // Viewport change handler - skip if triggered by internal update
    const handleMove = () => {
      if (internalUpdateRef.current) return
      onViewportChangeRef.current?.(getViewport(map))
    }

    map.on("load", loadHandler)
    map.on("style.load", styleLoadHandler)
    map.on("move", handleMove)
    setMapInstance(map)

    return () => {
      map.off("load", loadHandler)
      map.off("style.load", styleLoadHandler)
      map.off("move", handleMove)
      map.remove()
      setIsLoaded(false)
      setIsStyleLoaded(false)
      setMapInstance(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync controlled viewport to map
  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return
    if (mapInstance.isMoving()) return

    const current = getViewport(mapInstance)
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    }

    if (
      next.center[0] === current.center[0] &&
      next.center[1] === current.center[1] &&
      next.zoom === current.zoom &&
      next.bearing === current.bearing &&
      next.pitch === current.pitch
    ) {
      return
    }

    internalUpdateRef.current = true
    mapInstance.jumpTo(next)
    internalUpdateRef.current = false
  }, [mapInstance, isControlled, viewport])

  // Handle style change: close the gate (so layer children tear down and
  // re-add on the incoming style) - the swap itself is staged to the effect below.
  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return

    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light

    if (currentStyleRef.current === newStyle) return

    currentStyleRef.current = newStyle
    // Two-step swap from upstream: children must unmount their layers first.
    setIsStyleLoaded(false)
    setPendingStyle(newStyle)
  }, [mapInstance, resolvedTheme, mapStyles])

  useEffect(() => {
    if (!mapInstance || !pendingStyle) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingStyle(null)
    styleSwapInFlightRef.current = true
    // Full reload (no diff) so `style.load` fires deterministically. A
    // successful diff would never fire it, leaving isStyleLoaded stuck false.
    mapInstance.setStyle(pendingStyle, { diff: false })
  }, [mapInstance, pendingStyle])

  // Sync projection when the prop changes after mount.
  useEffect(() => {
    if (!mapInstance || !isStyleLoaded || !projection) return
    if (styleSwapInFlightRef.current) return
    mapInstance.setProjection(projection)
  }, [mapInstance, isStyleLoaded, projection])

  // No drag inertia under reduced motion.
  useEffect(() => {
    if (!mapInstance || !mapInstance.dragPan.isEnabled()) return
    mapInstance.dragPan.enable(reducedMotion ? { maxSpeed: 0 } : {})
  }, [mapInstance, reducedMotion])

  // Token colors are read from CSS, so they follow the theme class on <html>.
  // `resolvedTheme` is the cache key: a theme flip builds a fresh resolver.
  const resolveColor = useMemo(() => {
    const theme = resolvedTheme
    return (value: string) => {
      if (!value.includes("var(")) return value
      const probe = probeRef.current
      if (!probe) return value
      probe.dataset.theme = theme
      probe.style.color = ""
      probe.style.color = value
      return getComputedStyle(probe).color || value
    }
  }, [resolvedTheme])

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded: isLoaded && isStyleLoaded,
      resolvedTheme,
      reducedMotion,
      resolveColor,
    }),
    [
      mapInstance,
      isLoaded,
      isStyleLoaded,
      resolvedTheme,
      reducedMotion,
      resolveColor,
    ]
  )

  const busy = !isLoaded || loading

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        aria-busy={busy || undefined}
        data-slot="map"
        data-motion={reducedMotion ? "reduce" : "full"}
        className={cn("relative h-full w-full", className)}
      >
        <span ref={probeRef} aria-hidden className="hidden" />
        <span role="status" className="sr-only">
          {busy ? "Loading map" : ""}
        </span>
        {busy && <DefaultLoader overlay={isLoaded} />}
        {/* SSR-safe: children render only when map is loaded on client */}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  )
})

type MarkerContextValue = {
  marker: MapLibreGL.Marker
  map: MapLibreGL.Map | null
  longitude: number
  latitude: number
  /** Accessible name for the marker button. */
  label: string | undefined
  /** Renders a <button> when the marker opens a popup or has onClick. */
  interactive: boolean
  hasPopup: boolean
  open: boolean
  setOpen: (open: boolean, options?: { restoreFocus?: boolean }) => void
  triggerRef: RefObject<HTMLButtonElement | null>
  popupId: string
}

const MarkerContext = createContext<MarkerContextValue | null>(null)

function useMarkerContext() {
  const context = useContext(MarkerContext)
  if (!context) {
    throw new Error("Marker components must be used within MapMarker")
  }
  return context
}

type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number
  /** Latitude coordinate for marker position */
  latitude: number
  /** Marker subcomponents (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel) */
  children: ReactNode
  /**
   * Accessible name for the marker button (e.g. "Hearth & Field, Logan
   * Square"). Needed whenever the marker opens a popup or has onClick.
   */
  label?: string
  /** Same as `label`. */
  "aria-label"?: string
  /** Controlled popup state. Pair with `onOpenChange`. */
  open?: boolean
  /** Initial popup state when uncontrolled (default: false) */
  defaultOpen?: boolean
  /** Called when the marker's popup opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void
} & Omit<MarkerOptions, "element">

function MapMarker({
  longitude,
  latitude,
  children,
  label: labelProp,
  "aria-label": ariaLabel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap()
  const label = labelProp ?? ariaLabel
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupId = useId()

  const callbacksRef = useLatest({
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  })
  const onOpenChangeRef = useLatest(onOpenChange)

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpenControlled = openProp !== undefined
  const open = isOpenControlled ? openProp : uncontrolledOpen

  const setOpen = useCallback(
    (next: boolean, options?: { restoreFocus?: boolean }) => {
      if (!isOpenControlled) setUncontrolledOpen(next)
      onOpenChangeRef.current?.(next)
      if (!next && options?.restoreFocus) {
        triggerRef.current?.focus({ preventScroll: true })
      }
    },
    [isOpenControlled, onOpenChangeRef]
  )

  const hasPopup = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === MarkerPopup
  )
  const interactive = hasPopup || !!onClick

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable,
    }).setLngLat([longitude, latitude])

    return markerInstance

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Forward DOM and drag events to the latest callbacks.
  useEffect(() => {
    const element = marker.getElement()
    const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e)
    const handleMouseEnter = (e: MouseEvent) =>
      callbacksRef.current.onMouseEnter?.(e)
    const handleMouseLeave = (e: MouseEvent) =>
      callbacksRef.current.onMouseLeave?.(e)

    element.addEventListener("click", handleClick)
    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)

    const handleDragStart = () => {
      const lngLat = marker.getLngLat()
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat })
    }
    const handleDrag = () => {
      const lngLat = marker.getLngLat()
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat })
    }
    const handleDragEnd = () => {
      const lngLat = marker.getLngLat()
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat })
    }

    marker.on("dragstart", handleDragStart)
    marker.on("drag", handleDrag)
    marker.on("dragend", handleDragEnd)

    return () => {
      element.removeEventListener("click", handleClick)
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
      marker.off("dragstart", handleDragStart)
      marker.off("drag", handleDrag)
      marker.off("dragend", handleDragEnd)
    }
  }, [marker, callbacksRef])

  useEffect(() => {
    if (!map) return

    marker.addTo(map)

    return () => {
      marker.remove()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  const { offset, rotation, rotationAlignment, pitchAlignment } = markerOptions

  useEffect(() => {
    const current = marker.getLngLat()
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude])
    }

    if (marker.isDraggable() !== draggable) {
      marker.setDraggable(draggable)
    }

    const currentOffset = marker.getOffset()
    const newOffset = offset ?? [0, 0]
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset)
      ? newOffset
      : [newOffset.x, newOffset.y]
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
      marker.setOffset(newOffset)
    }

    if (marker.getRotation() !== (rotation ?? 0)) {
      marker.setRotation(rotation ?? 0)
    }
    if (marker.getRotationAlignment() !== (rotationAlignment ?? "auto")) {
      marker.setRotationAlignment(rotationAlignment ?? "auto")
    }
    if (marker.getPitchAlignment() !== (pitchAlignment ?? "auto")) {
      marker.setPitchAlignment(pitchAlignment ?? "auto")
    }
  }, [
    marker,
    longitude,
    latitude,
    draggable,
    offset,
    rotation,
    rotationAlignment,
    pitchAlignment,
  ])

  // An open popup lifts its marker above its neighbours.
  useEffect(() => {
    marker.getElement().style.zIndex = open ? "1" : ""
  }, [marker, open])

  useEffect(() => {
    const element = triggerRef.current
    if (interactive && element && !label && !element.textContent?.trim()) {
      warn("Give interactive markers a `label` (their accessible name).")
    }
  }, [interactive, label])

  const contextValue = useMemo(
    () => ({
      marker,
      map,
      longitude,
      latitude,
      label,
      interactive,
      hasPopup,
      open,
      setOpen,
      triggerRef,
      popupId,
    }),
    [
      marker,
      map,
      longitude,
      latitude,
      label,
      interactive,
      hasPopup,
      open,
      setOpen,
      popupId,
    ]
  )

  return (
    <MarkerContext.Provider value={contextValue}>
      {children}
    </MarkerContext.Provider>
  )
}

type MarkerContentProps = {
  /** Custom marker content. Defaults to a canopy dot if not provided */
  children?: ReactNode
  /** Additional CSS classes for the marker container */
  className?: string
}

function MarkerContent({ children, className }: MarkerContentProps) {
  const {
    marker,
    label,
    interactive,
    hasPopup,
    open,
    setOpen,
    triggerRef,
    popupId,
  } = useMarkerContext()
  const content = children || <DefaultMarkerIcon />

  if (!interactive) {
    return createPortal(
      <div
        data-slot="map-marker"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={cn("relative", className)}
      >
        {content}
      </div>,
      marker.getElement()
    )
  }

  return createPortal(
    <button
      ref={triggerRef}
      type="button"
      data-slot="map-marker"
      data-state={hasPopup ? (open ? "open" : "closed") : undefined}
      aria-label={label}
      aria-haspopup={hasPopup ? "dialog" : undefined}
      aria-expanded={hasPopup ? open : undefined}
      aria-controls={hasPopup && open ? popupId : undefined}
      onClick={() => {
        if (hasPopup) setOpen(!open)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation()
          setOpen(false)
        }
      }}
      className={cn(
        "relative block cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {content}
    </button>,
    marker.getElement()
  )
}

function DefaultMarkerIcon() {
  return (
    <div className="relative size-4 rounded-full border-2 border-background bg-primary shadow-sm" />
  )
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close popup"
      className="duration-snap absolute top-1 right-1 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <X className="size-3.5" />
    </button>
  )
}

type PopupPanelProps = {
  id?: string
  label: string
  className?: string
  closeButton: boolean
  onDismiss: () => void
  panelRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

/** Shared popup surface: a labelled dialog that closes on Escape. */
function PopupPanel({
  id,
  label,
  className,
  closeButton,
  onDismiss,
  panelRef,
  children,
}: PopupPanelProps) {
  const { reducedMotion } = useMap()
  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      data-slot="map-popup"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation()
          onDismiss()
        }
      }}
      className={cn(
        "relative max-w-62 rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md outline-none",
        "duration-overlay animate-in ease-enter fade-in-0",
        // Rise 6px from the marker (spatial origin). Reduced motion: fade only.
        !reducedMotion && "slide-in-from-bottom-1.5",
        closeButton && "pr-8",
        className
      )}
    >
      {children}
      {/* After the content, so focus lands on the first real action. */}
      {closeButton && <PopupCloseButton onClick={onDismiss} />}
    </div>
  )
}

type MarkerPopupProps = {
  /** Popup content */
  children: ReactNode
  /** Additional CSS classes for the popup container */
  className?: string
  /** Show a labelled close button in the popup (default: true) */
  closeButton?: boolean
  /** Move focus into the popup when it opens (default: true) */
  focusOnOpen?: boolean
  /** Accessible name for the popup dialog. Defaults to the marker label. */
  "aria-label"?: string
} & Omit<PopupOptions, "className" | "closeButton" | "focusAfterOpen">

function MarkerPopup({
  children,
  className,
  closeButton = true,
  focusOnOpen = true,
  "aria-label": ariaLabel,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker, map, longitude, latitude, open, setOpen, label, popupId } =
    useMarkerContext()
  const container = useMemo(() => document.createElement("div"), [])
  const panelRef = useRef<HTMLDivElement>(null)
  const { offset, maxWidth, closeOnClick = true } = popupOptions

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      // Click-to-close and focus are handled below so a click on the marker
      // itself does not close the popup it just opened.
      closeButton: false,
      closeOnClick: false,
      focusAfterOpen: false,
    })
      .setMaxWidth("none")
      .setDOMContent(container)

    return popupInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Open and close with the marker's state.
  useEffect(() => {
    if (!map || !open) return

    popup.setLngLat(marker.getLngLat()).addTo(map)
    const frame = focusOnOpen
      ? requestAnimationFrame(() => focusFirst(panelRef.current))
      : 0

    const follow = () => popup.setLngLat(marker.getLngLat())
    const handleClose = () => setOpen(false)
    const handleMapClick = (e: MapLibreGL.MapMouseEvent) => {
      const target = e.originalEvent.target as Node | null
      if (target && marker.getElement().contains(target)) return
      setOpen(false)
    }

    marker.on("drag", follow)
    popup.on("close", handleClose)
    if (closeOnClick) map.on("click", handleMapClick)

    return () => {
      cancelAnimationFrame(frame)
      marker.off("drag", follow)
      popup.off("close", handleClose)
      map.off("click", handleMapClick)
      if (popup.isOpen()) popup.remove()
    }
  }, [map, open, marker, popup, focusOnOpen, closeOnClick, setOpen])

  // Follow the marker when its coordinates change.
  useEffect(() => {
    if (popup.isOpen()) popup.setLngLat([longitude, latitude])
  }, [popup, longitude, latitude])

  // Sync popup options when they change.
  useEffect(() => {
    popup.setOffset(offset ?? 16)
    if (maxWidth) {
      popup.setMaxWidth(maxWidth)
    }
  }, [popup, offset, maxWidth])

  return createPortal(
    <PopupPanel
      id={popupId}
      label={ariaLabel ?? label ?? "Map popup"}
      className={className}
      closeButton={closeButton}
      onDismiss={() => setOpen(false, { restoreFocus: true })}
      panelRef={panelRef}
    >
      {children}
    </PopupPanel>,
    container
  )
}

type MarkerTooltipProps = {
  /** Tooltip content */
  children: ReactNode
  /** Additional CSS classes for the tooltip container */
  className?: string
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">

function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext()
  const { reducedMotion } = useMap()
  const container = useMemo(() => document.createElement("div"), [])
  const { offset, maxWidth } = popupOptions

  const tooltip = useMemo(() => {
    const tooltipInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
      focusAfterOpen: false,
    }).setMaxWidth("none")

    return tooltipInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    tooltip.setDOMContent(container)

    const show = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map)
    }
    const hide = () => tooltip.remove()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide()
    }

    // Hover and keyboard focus both show the tooltip.
    const element = marker.getElement()
    element.addEventListener("mouseenter", show)
    element.addEventListener("mouseleave", hide)
    element.addEventListener("focusin", show)
    element.addEventListener("focusout", hide)
    element.addEventListener("keydown", handleKeyDown)

    return () => {
      element.removeEventListener("mouseenter", show)
      element.removeEventListener("mouseleave", hide)
      element.removeEventListener("focusin", show)
      element.removeEventListener("focusout", hide)
      element.removeEventListener("keydown", handleKeyDown)
      tooltip.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Sync tooltip options when they change.
  useEffect(() => {
    tooltip.setOffset(offset ?? 16)
    if (maxWidth) {
      tooltip.setMaxWidth(maxWidth)
    }
  }, [tooltip, offset, maxWidth])

  return createPortal(
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs text-balance text-background shadow-md",
        "duration-ui animate-in ease-enter fade-in-0",
        !reducedMotion && "slide-in-from-bottom-1",
        className
      )}
    >
      {children}
    </div>,
    container
  )
}

type MarkerLabelProps = {
  /** Label text content */
  children: ReactNode
  /** Additional CSS classes for the label */
  className?: string
  /** Position of the label relative to the marker (default: "top") */
  position?: "top" | "bottom"
}

function MarkerLabel({
  children,
  className,
  position = "top",
}: MarkerLabelProps) {
  const positionClasses = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1",
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "rounded-sm bg-background/80 px-1 text-[11px] font-medium text-foreground",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  )
}

type MapControlsProps = {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean
  /**
   * Show a scale bar in the opposite bottom corner (default: false). Pass an
   * object to pick units.
   */
  showScale?:
    boolean | { unit?: "metric" | "imperial" | "nautical"; maxWidth?: number }
  /** Additional CSS classes for the controls container */
  className?: string
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void
}

const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
}

function ControlGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
      {children}
    </div>
  )
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void
  label: string
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      type="button"
      className={cn(
        "duration-snap flex size-8 items-center justify-center text-foreground transition-colors",
        "first:rounded-t-md last:rounded-b-md",
        "hover:bg-accent dark:hover:bg-accent/40",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  showScale = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map, reducedMotion } = useMap()
  const [waitingForLocation, setWaitingForLocation] = useState(false)
  const duration = reducedMotion ? 0 : CAMERA_DURATION

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration })
  }, [map, duration])

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration })
  }, [map, duration])

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration })
  }, [map, duration])

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) return
    setWaitingForLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        }
        map?.easeTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration,
        })
        onLocate?.(coords)
        setWaitingForLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        setWaitingForLocation(false)
      },
      // Without a timeout the spec default is Infinity: a dismissed permission
      // prompt would leave the button disabled forever.
      { timeout: 10000 }
    )
  }, [map, onLocate, duration])

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer()
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }, [map])

  const scaleUnit = typeof showScale === "object" ? showScale.unit : undefined
  const scaleMaxWidth =
    typeof showScale === "object" ? showScale.maxWidth : undefined

  useEffect(() => {
    if (!map || !showScale) return
    const control = new MapLibreGL.ScaleControl({
      unit: scaleUnit ?? "metric",
      maxWidth: scaleMaxWidth ?? 100,
    })
    map.addControl(
      control,
      position.endsWith("right") ? "bottom-left" : "bottom-right"
    )
    return () => {
      map.removeControl(control)
    }
  }, [map, showScale, scaleUnit, scaleMaxWidth, position])

  return (
    <div
      role="group"
      aria-label="Map controls"
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={handleResetBearing} />
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            onClick={handleLocate}
            label="Find my location"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <Loader2
                className={cn("size-4", !reducedMotion && "animate-spin")}
              />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  )
}

function CompassButton({ onClick }: { onClick: () => void }) {
  const { map } = useMap()
  const compassRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!map || !compassRef.current) return

    const compass = compassRef.current

    const updateRotation = () => {
      const bearing = map.getBearing()
      const pitch = map.getPitch()
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`
    }

    map.on("rotate", updateRotation)
    map.on("pitch", updateRotation)
    updateRotation()

    return () => {
      map.off("rotate", updateRotation)
      map.off("pitch", updateRotation)
    }
  }, [map])

  return (
    <ControlButton onClick={onClick} label="Reset bearing to north">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        aria-hidden
        className="size-5"
        style={{ transformStyle: "preserve-3d" }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-destructive" />
        <path d="M12 2L8 12H12V2Z" className="fill-destructive/50" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </ControlButton>
  )
}

type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number
  /** Latitude coordinate for popup position */
  latitude: number
  /** Callback when popup is closed */
  onClose?: () => void
  /** Popup content */
  children: ReactNode
  /** Additional CSS classes for the popup container */
  className?: string
  /** Show a labelled close button in the popup (default: true) */
  closeButton?: boolean
  /**
   * Move focus into the popup when it opens and back to the previously
   * focused element when it closes from Escape or the close button
   * (default: true)
   */
  focusOnOpen?: boolean
  /** Accessible name for the popup dialog (default: "Map popup") */
  "aria-label"?: string
} & Omit<PopupOptions, "className" | "closeButton" | "focusAfterOpen">

function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = true,
  focusOnOpen = true,
  "aria-label": ariaLabel = "Map popup",
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap()
  const onCloseRef = useLatest(onClose)
  const container = useMemo(() => document.createElement("div"), [])
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const { offset, maxWidth } = popupOptions

  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false,
      focusAfterOpen: false,
    })
      .setMaxWidth("none")
      .setLngLat([longitude, latitude])

    return popupInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return

    const onCloseProp = () => onCloseRef.current?.()

    popup.on("close", onCloseProp)

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    popup.setDOMContent(container)
    popup.addTo(map)
    const frame = focusOnOpen
      ? requestAnimationFrame(() => focusFirst(panelRef.current))
      : 0

    return () => {
      cancelAnimationFrame(frame)
      popup.off("close", onCloseProp)
      if (popup.isOpen()) {
        popup.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Sync popup position and options when they change.
  useEffect(() => {
    const current = popup.getLngLat()
    if (!current || current.lng !== longitude || current.lat !== latitude) {
      popup.setLngLat([longitude, latitude])
    }
    popup.setOffset(offset ?? 16)
    if (maxWidth) {
      popup.setMaxWidth(maxWidth)
    }
  }, [popup, longitude, latitude, offset, maxWidth])

  const handleDismiss = () => {
    const returnTo = returnFocusRef.current
    popup.remove()
    if (focusOnOpen && returnTo?.isConnected) {
      returnTo.focus({ preventScroll: true })
    }
  }

  return createPortal(
    <PopupPanel
      label={ariaLabel}
      className={className}
      closeButton={closeButton}
      onDismiss={handleDismiss}
      panelRef={panelRef}
    >
      {children}
    </PopupPanel>,
    container
  )
}

/** A position along a route: an endpoint, the progress cut, or a 0-1 fraction. */
type RouteAnchor = "start" | "end" | "progress" | number

type RouteMeasure = {
  /** Distance from the first coordinate to each vertex. */
  cumulative: number[]
  /** Length of the whole route. `0` for routes with fewer than two vertices. */
  total: number
}

const EMPTY_ROUTE_MEASURE: RouteMeasure = { cumulative: [], total: 0 }
const EMPTY_COORDINATES: [number, number][] = []

/**
 * `beforeId`, but only when that layer is actually in the style. MapLibre's
 * `addLayer` fires an error and returns *without adding the layer* when
 * `before` is missing, which would silently drop the route — easy to hit with
 * a `beforeId` that exists in one basemap but not another.
 */
function resolveBeforeId(map: MapLibreGL.Map, beforeId: string | undefined) {
  return beforeId && map.getLayer(beforeId) ? beforeId : undefined
}

function clampFraction(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

/**
 * Cumulative length along the route. Segment lengths use an equirectangular
 * approximation (longitude scaled by cos(latitude)) — accurate enough for
 * splitting a route at a fraction, and much cheaper than haversine.
 */
function measureRoute(coordinates: [number, number][]): RouteMeasure {
  if (coordinates.length < 2) return EMPTY_ROUTE_MEASURE

  const cumulative = [0]
  let total = 0

  for (let i = 1; i < coordinates.length; i += 1) {
    const [lng1, lat1] = coordinates[i - 1]
    const [lng2, lat2] = coordinates[i]
    const midLat = ((lat1 + lat2) / 2) * (Math.PI / 180)
    total += Math.hypot((lng2 - lng1) * Math.cos(midLat), lat2 - lat1)
    cumulative.push(total)
  }

  return { cumulative, total }
}

/** Index of the segment that contains `distance`, clamped to the route. */
function findSegmentIndex(cumulative: number[], distance: number) {
  let low = 0
  let high = cumulative.length - 1

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (cumulative[mid] < distance) low = mid + 1
    else high = mid
  }

  return Math.min(low === 0 ? 0 : low - 1, cumulative.length - 2)
}

/** The [longitude, latitude] sitting `fraction` of the way along the route. */
function pointAtFraction(
  coordinates: [number, number][],
  measure: RouteMeasure,
  fraction: number
): [number, number] | null {
  if (coordinates.length === 0) return null
  if (coordinates.length === 1 || measure.total === 0) return coordinates[0]

  const target = measure.total * clampFraction(fraction)
  const index = findSegmentIndex(measure.cumulative, target)
  const [lng1, lat1] = coordinates[index]
  const [lng2, lat2] = coordinates[index + 1]
  const segment = measure.cumulative[index + 1] - measure.cumulative[index]
  const ratio =
    segment === 0 ? 0 : (target - measure.cumulative[index]) / segment

  return [lng1 + (lng2 - lng1) * ratio, lat1 + (lat2 - lat1) * ratio]
}

/**
 * The portion of the route up to `fraction`. The final point is interpolated,
 * so the slice ends exactly at the fraction rather than at the nearest vertex.
 */
function sliceAtFraction(
  coordinates: [number, number][],
  measure: RouteMeasure,
  fraction: number
): [number, number][] {
  if (coordinates.length < 2) return []

  const t = clampFraction(fraction)
  if (t <= 0 || measure.total === 0) return []
  if (t >= 1) return coordinates

  const target = measure.total * t
  const index = findSegmentIndex(measure.cumulative, target)
  const point = pointAtFraction(coordinates, measure, t)
  const traveled = coordinates.slice(0, index + 1)
  if (point) traveled.push(point)

  return traveled
}

type RouteContextValue = {
  /** Resolved route id — child layers namespace themselves with it. */
  id: string
  /** True once the base source and layer are on the map. */
  ready: boolean
  coordinates: [number, number][]
  /** The traveled slice of the route. Empty when `progress` is unset. */
  traveled: [number, number][]
  progress: number | undefined
  /** Base line style, with `active` overrides already applied. */
  color: string
  width: number
  opacity: number
  dashArray: [number, number] | undefined
  /** Layer the route sits below. Child layers insert before it too. */
  beforeId: string | undefined
  /**
   * Resolves an anchor to a coordinate. `null` when the route is empty, or
   * for `"progress"` while `progress` is unset.
   */
  pointAt: (at: RouteAnchor) => [number, number] | null
  /** Registers a child layer so it follows the route when `active` flips. */
  registerLayer: (layerId: string) => () => void
}

const RouteContext = createContext<RouteContextValue | null>(null)

function useMapRoute() {
  const context = useContext(RouteContext)
  if (!context) {
    throw new Error("Route components must be used within MapRoute")
  }
  return context
}

type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string
  /**
   * The route as [longitude, latitude] pairs. This is the only input the
   * component needs, so any routing service works: fetch in the parent and
   * pass the geometry (for GeoJSON responses, `route.geometry.coordinates`).
   */
  coordinates: [number, number][]
  /** Line color: any CSS color or `var(--token)` (default: "var(--chart-1)") */
  color?: string
  /** Line width in pixels (default: 3) */
  width?: number
  /** Line opacity from 0 to 1 (default: 0.8) */
  opacity?: number
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number]
  /**
   * Fraction of the route already covered, from 0 to 1. Drives `RouteProgress`
   * and the `"progress"` anchor on `RouteMarker`.
   */
  progress?: number
  /**
   * Marks this route as the selected one: it moves above sibling routes and
   * switches to the `active*` styles below. (default: false)
   */
  active?: boolean
  /** Line color while `active`. Falls back to `color`. */
  activeColor?: string
  /** Line width while `active`. Falls back to `width`. */
  activeWidth?: number
  /** Line opacity while `active`. Falls back to `opacity`. */
  activeOpacity?: number
  /** Dash pattern while `active`. Falls back to `dashArray`. */
  activeDashArray?: [number, number]
  /** Optional MapLibre layer id to insert the route layers before (z-order control). */
  beforeId?: string
  /** Callback when the route line is clicked */
  onClick?: () => void
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean
  /** Route subcomponents (RouteProgress, RouteMarker) */
  children?: ReactNode
}

function MapRoute({
  id: propId,
  coordinates: coordinatesProp,
  color = "var(--chart-1)",
  width = 3,
  opacity = 0.8,
  dashArray,
  progress,
  active = false,
  activeColor,
  activeWidth,
  activeOpacity,
  activeDashArray,
  beforeId,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
  children,
}: MapRouteProps) {
  const { map, isLoaded, resolveColor } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `route-source-${id}`
  const layerId = `route-layer-${id}`
  const [ready, setReady] = useState(false)

  // Callers often pass `data?.coordinates ?? []`, a fresh array each render.
  // Collapse empties to one shared instance so nothing downstream re-runs.
  const coordinates =
    coordinatesProp.length > 0 ? coordinatesProp : EMPTY_COORDINATES

  const resolvedColor = resolveColor(active ? (activeColor ?? color) : color)
  const resolvedWidth = active ? (activeWidth ?? width) : width
  const resolvedOpacity = active ? (activeOpacity ?? opacity) : opacity
  const resolvedDashArray = active ? (activeDashArray ?? dashArray) : dashArray

  const measure = useMemo(() => measureRoute(coordinates), [coordinates])
  const traveled = useMemo(
    () =>
      progress === undefined
        ? []
        : sliceAtFraction(coordinates, measure, progress),
    [coordinates, measure, progress]
  )

  const pointAt = useCallback(
    (at: RouteAnchor) => {
      if (coordinates.length === 0) return null
      if (at === "start") return coordinates[0]
      if (at === "end") return coordinates[coordinates.length - 1]
      if (at === "progress") {
        if (progress === undefined) return null
        return pointAtFraction(coordinates, measure, progress)
      }
      return pointAtFraction(coordinates, measure, at)
    },
    [coordinates, measure, progress]
  )

  // Child layers, in the order they mounted. Kept in a ref so registering one
  // doesn't re-render the route.
  const childLayersRef = useRef<string[]>([])
  const registerLayer = useCallback((childLayerId: string) => {
    childLayersRef.current = [...childLayersRef.current, childLayerId]
    return () => {
      childLayersRef.current = childLayersRef.current.filter(
        (entry) => entry !== childLayerId
      )
    }
  }, [])

  // Add source and layer on mount
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    })

    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": resolvedColor,
          "line-width": resolvedWidth,
          "line-opacity": resolvedOpacity,
          ...(resolvedDashArray && { "line-dasharray": resolvedDashArray }),
        },
      },
      resolveBeforeId(map, beforeId)
    )

    // Children add their layers once this is set, which keeps them above the
    // base line: child effects would otherwise run before this one.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- upstream ordering gate
    setReady(true)

    return () => {
      setReady(false)
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // When coordinates change, update the source data
  useEffect(() => {
    if (!isLoaded || !map) return

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates.length < 2 ? [] : coordinates,
        },
      })
    }
  }, [isLoaded, map, coordinates, sourceId])

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return

    map.setPaintProperty(layerId, "line-color", resolvedColor)
    map.setPaintProperty(layerId, "line-width", resolvedWidth)
    map.setPaintProperty(layerId, "line-opacity", resolvedOpacity)
    map.setPaintProperty(layerId, "line-dasharray", resolvedDashArray)
  }, [
    isLoaded,
    map,
    layerId,
    resolvedColor,
    resolvedWidth,
    resolvedOpacity,
    resolvedDashArray,
  ])

  // Raise the active route (and anything it owns) above its siblings. With a
  // `beforeId` it moves to the top of the group below that layer instead.
  // Siblings that mount later (alternatives arriving from a request) add
  // their layers on top, so the raise also re-runs on style changes.
  useEffect(() => {
    if (!ready || !map || !active) return

    // Which layers exist, ignoring their order.
    let lastLayerSet = ""

    const raise = () => {
      const order = map.getLayersOrder()

      // React only when layers are added or removed, never to a reorder.
      // `moveLayer` fires "styledata" itself, so reacting to order would loop
      // — with one route against its own move, and with two `active` routes
      // against each other, forever.
      const layerSet = [...order].sort().join("|")
      if (layerSet === lastLayerSet) return
      lastLayerSet = layerSet

      const owned = [layerId, ...childLayersRef.current].filter((entry) =>
        map.getLayer(entry)
      )
      if (owned.length === 0) return

      const before = resolveBeforeId(map, beforeId)
      const limit = before ? order.indexOf(before) : order.length
      const top = order.slice(Math.max(0, limit - owned.length), limit)
      if (owned.every((entry, index) => top[index] === entry)) return

      for (const entry of owned) map.moveLayer(entry, before)
    }

    raise()
    map.on("styledata", raise)

    return () => {
      map.off("styledata", raise)
    }
  }, [ready, map, active, layerId, beforeId])

  // Handle click and hover events
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return

    const handleClick = () => {
      onClick?.()
    }
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer"
      onMouseEnter?.()
    }
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ""
      onMouseLeave?.()
    }

    map.on("click", layerId, handleClick)
    map.on("mouseenter", layerId, handleMouseEnter)
    map.on("mouseleave", layerId, handleMouseLeave)

    return () => {
      map.off("click", layerId, handleClick)
      map.off("mouseenter", layerId, handleMouseEnter)
      map.off("mouseleave", layerId, handleMouseLeave)
    }
  }, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive])

  const contextValue = useMemo(
    () => ({
      id,
      ready,
      coordinates,
      traveled,
      progress,
      color: resolvedColor,
      width: resolvedWidth,
      opacity: resolvedOpacity,
      dashArray: resolvedDashArray,
      beforeId,
      pointAt,
      registerLayer,
    }),
    [
      id,
      ready,
      coordinates,
      traveled,
      progress,
      resolvedColor,
      resolvedWidth,
      resolvedOpacity,
      resolvedDashArray,
      beforeId,
      pointAt,
      registerLayer,
    ]
  )

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  )
}

type RouteProgressProps = {
  /** Line color for the traveled portion. Defaults to the route's color. */
  color?: string
  /** Line width in pixels. Defaults to the route's width. */
  width?: number
  /** Line opacity from 0 to 1. Defaults to the route's opacity. */
  opacity?: number
  /** Dash pattern [dash length, gap length] for dashed lines. */
  dashArray?: [number, number]
}

/**
 * Draws the traveled portion of the parent `MapRoute` on top of the base line.
 * Renders nothing until the route has a `progress` value.
 */
function RouteProgress({
  color,
  width,
  opacity,
  dashArray,
}: RouteProgressProps) {
  const { map, isLoaded, resolveColor } = useMap()
  const route = useMapRoute()
  const { ready, traveled, registerLayer, beforeId } = route

  const sourceId = `route-progress-source-${route.id}`
  const layerId = `route-progress-layer-${route.id}`

  const resolvedColor = resolveColor(color ?? route.color)
  const resolvedWidth = width ?? route.width
  const resolvedOpacity = opacity ?? route.opacity

  // Added only once the parent's layer exists, so this always paints above it.
  useEffect(() => {
    if (!ready || !map) return

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    })

    // Sits directly above the parent line: same `beforeId` boundary, added
    // after it.
    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": resolvedColor,
          "line-width": resolvedWidth,
          "line-opacity": resolvedOpacity,
          ...(dashArray && { "line-dasharray": dashArray }),
        },
      },
      resolveBeforeId(map, beforeId)
    )

    const unregister = registerLayer(layerId)

    return () => {
      unregister()
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, map])

  useEffect(() => {
    if (!ready || !map) return

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: traveled.length < 2 ? [] : traveled,
        },
      })
    }
  }, [ready, map, traveled, sourceId])

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return

    map.setPaintProperty(layerId, "line-color", resolvedColor)
    map.setPaintProperty(layerId, "line-width", resolvedWidth)
    map.setPaintProperty(layerId, "line-opacity", resolvedOpacity)
    map.setPaintProperty(layerId, "line-dasharray", dashArray)
  }, [
    isLoaded,
    map,
    layerId,
    resolvedColor,
    resolvedWidth,
    resolvedOpacity,
    dashArray,
  ])

  return null
}

type RouteMarkerProps = {
  /**
   * Where to pin the marker: an endpoint, the route's progress point, or a
   * 0-1 fraction along the line.
   */
  at: RouteAnchor
} & Omit<MapMarkerProps, "longitude" | "latitude">

/**
 * A `MapMarker` anchored to a position along the parent `MapRoute`. Takes the
 * same children as `MapMarker` (`MarkerContent`, `MarkerPopup`, ...).
 */
function RouteMarker({ at, children, ...markerProps }: RouteMarkerProps) {
  const { pointAt } = useMapRoute()
  const position = pointAt(at)

  // Nothing to pin to yet: the route is empty (coordinates usually arrive
  // from a request), or `at="progress"` is waiting on a `progress` value.
  if (!position) return null

  return (
    <MapMarker longitude={position[0]} latitude={position[1]} {...markerProps}>
      {children}
    </MapMarker>
  )
}

type MapGeoJSONData<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> =
  | GeoJSON.FeatureCollection<GeoJSON.Geometry, P>
  | GeoJSON.Feature<GeoJSON.Geometry, P>
  | GeoJSON.Geometry
  | string

type MapFillPaint = NonNullable<MapLibreGL.FillLayerSpecification["paint"]>
type MapLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>

/** A rendered feature with strongly-typed `properties`. */
type MapGeoJSONFeature<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = Omit<MapLibreGL.MapGeoJSONFeature, "properties"> & { properties: P }

/** Event payload passed to MapGeoJSON interaction callbacks. */
type MapGeoJSONEvent<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** The feature under the cursor, with its typed GeoJSON properties. */
  feature: MapGeoJSONFeature<P>
  /** Longitude of the cursor at the time of the event. */
  longitude: number
  /** Latitude of the cursor at the time of the event. */
  latitude: number
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapLayerMouseEvent
}

type MapGeoJSONProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON data (FeatureCollection, Feature, Geometry) or a URL to fetch it from. */
  data: MapGeoJSONData<P>
  /** Optional unique identifier prefix for the source/layers. Auto-generated if not provided. */
  id?: string
  /**
   * Feature property to promote to the feature `id`. Required for hover
   * feature-state (`fillHoverPaint`) and stable `onHover`/`onClick` payloads.
   */
  promoteId?: string
  /**
   * Paint for the polygon fill layer. Merged on top of a theme-aware monochrome
   * surface tone (`fill-color`). Pass `false` to omit the fill layer entirely
   * (e.g. outlines only).
   */
  fillPaint?: MapFillPaint | false
  /**
   * Paint for the outline layer. Merged on top of a hairline default
   * (`line-color` = a near-surface neutral, `line-width` = 0.5) for thin
   * separators. Override `line-color` if your container differs, or pass
   * `false` to omit the layer.
   */
  linePaint?: MapLinePaint | false
  /**
   * Paint merged onto the fill layer for the feature under the cursor, applied
   * as a `case` expression keyed on hover feature-state. Requires `promoteId`.
   */
  fillHoverPaint?: MapFillPaint
  /** Callback when a feature is clicked. */
  onClick?: (e: MapGeoJSONEvent<P>) => void
  /** Callback fired when the hovered feature changes; `null` when the cursor leaves. */
  onHover?: (e: MapGeoJSONEvent<P> | null) => void
  /** Whether features respond to mouse events (default: false). */
  interactive?: boolean
  /** Optional MapLibre layer id to insert the layers before (z-order control). */
  beforeId?: string
}

// Monochrome defaults from Ravenwood tokens: a muted fill with a hairline in
// the page background. Override via `fillPaint` / `linePaint`; any color in
// them may be a `var(--token)`.
const GEOJSON_DEFAULT_COLORS = {
  fill: "var(--muted)",
  line: "var(--background)",
}

/**
 * Renders arbitrary GeoJSON as fill + outline layers on the map. Composes like
 * `MapRoute` / `MapArc` — drop it inside `<Map>` (typically with `blank`) for
 * choropleths and region/data maps. For full control over expressions and
 * multiple layers, manage layers directly via `useMap()` instead.
 */
function MapGeoJSON<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  data,
  id: propId,
  promoteId,
  fillPaint,
  linePaint,
  fillHoverPaint,
  onClick,
  onHover,
  interactive = false,
  beforeId,
}: MapGeoJSONProps<P>) {
  const { map, isLoaded, resolveColor } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `geojson-source-${id}`
  const fillLayerId = `geojson-fill-${id}`
  const lineLayerId = `geojson-line-${id}`

  const defaults = GEOJSON_DEFAULT_COLORS

  const showFill = fillPaint !== false
  const showLine = linePaint !== false

  const mergedFillPaint = useMemo(
    () =>
      resolvePaint(
        mergeHoverPaint(
          { "fill-color": defaults.fill, ...(fillPaint || {}) },
          fillHoverPaint
        ),
        resolveColor
      ),
    [defaults.fill, fillPaint, fillHoverPaint, resolveColor]
  )
  const mergedLinePaint = useMemo(
    () =>
      resolvePaint(
        {
          "line-color": defaults.line,
          "line-width": 0.5,
          ...(linePaint || {}),
        },
        resolveColor
      ),
    [defaults.line, linePaint, resolveColor]
  )
  const latestRef = useLatest({ onClick, onHover })

  // Add source on mount.
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      type: "geojson",
      data,
      ...(promoteId ? { promoteId } : {}),
    })

    return () => {
      try {
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // style may be mid-reload
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Sync data when it changes.
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as
      MapLibreGL.GeoJSONSource | undefined
    source?.setData(data as never)
  }, [isLoaded, map, data, sourceId])

  // Sync layers and paint when visibility or styling changes.
  useEffect(() => {
    if (!isLoaded || !map) return

    const source = map.getSource(sourceId)
    if (!source) return

    if (showFill && !map.getLayer(fillLayerId)) {
      map.addLayer(
        {
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: mergedFillPaint,
        },
        beforeId
      )
    } else if (!showFill && map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId)
    }

    if (showLine && !map.getLayer(lineLayerId)) {
      map.addLayer(
        {
          id: lineLayerId,
          type: "line",
          source: sourceId,
          paint: mergedLinePaint,
        },
        beforeId
      )
    } else if (!showLine && map.getLayer(lineLayerId)) {
      map.removeLayer(lineLayerId)
    }

    if (showFill && map.getLayer(fillLayerId)) {
      for (const [key, value] of Object.entries(mergedFillPaint)) {
        map.setPaintProperty(
          fillLayerId,
          key as keyof MapFillPaint,
          value as never
        )
      }
    }
    if (showLine && map.getLayer(lineLayerId)) {
      for (const [key, value] of Object.entries(mergedLinePaint)) {
        map.setPaintProperty(
          lineLayerId,
          key as keyof MapLinePaint,
          value as never
        )
      }
    }
  }, [
    isLoaded,
    map,
    sourceId,
    fillLayerId,
    lineLayerId,
    showFill,
    showLine,
    mergedFillPaint,
    mergedLinePaint,
    beforeId,
  ])

  // Interaction handlers (bound to the fill layer).
  useEffect(() => {
    if (!isLoaded || !map || !interactive || !showFill) return

    let hoveredId: string | number | null = null

    const setHover = (next: string | number | null) => {
      if (next === hoveredId) return
      const sourceExists = !!map.getSource(sourceId)
      if (hoveredId != null && sourceExists) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false }
        )
      }
      hoveredId = next
      if (next != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: next }, { hover: true })
      }
    }

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature) return
      map.getCanvas().style.cursor = "pointer"

      const featureId = feature.id
      if (featureId === hoveredId) return
      setHover(featureId ?? null)
      latestRef.current.onHover?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      })
    }

    const handleMouseLeave = () => {
      setHover(null)
      map.getCanvas().style.cursor = ""
      latestRef.current.onHover?.(null)
    }

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature) return
      latestRef.current.onClick?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      })
    }

    map.on("mousemove", fillLayerId, handleMouseMove)
    map.on("mouseleave", fillLayerId, handleMouseLeave)
    map.on("click", fillLayerId, handleClick)

    return () => {
      map.off("mousemove", fillLayerId, handleMouseMove)
      map.off("mouseleave", fillLayerId, handleMouseLeave)
      map.off("click", fillLayerId, handleClick)
      setHover(null)
      map.getCanvas().style.cursor = ""
    }
  }, [isLoaded, map, fillLayerId, sourceId, interactive, showFill, latestRef])

  return null
}

/** A single arc to render inside <MapArc data={...}>. */
type MapArcDatum = {
  /** Unique identifier for this arc. Required for hover state tracking and event payloads. */
  id: string | number
  /** Start coordinate as [longitude, latitude]. */
  from: [number, number]
  /** End coordinate as [longitude, latitude]. */
  to: [number, number]
}

/** Event payload passed to MapArc interaction callbacks. */
type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
  /** The arc datum that was hovered or clicked. */
  arc: T
  /** Longitude of the cursor at the time of the event. */
  longitude: number
  /** Latitude of the cursor at the time of the event. */
  latitude: number
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapMouseEvent
}

type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>
type MapArcLineLayout = NonNullable<MapLibreGL.LineLayerSpecification["layout"]>

type MapArcProps<T extends MapArcDatum = MapArcDatum> = {
  /** Array of arcs to render. Each arc must have a unique `id`. */
  data: T[]
  /** Optional unique identifier prefix for the arc source/layers. Auto-generated if not provided. */
  id?: string
  /**
   * How far each arc bows away from a straight line. `0` renders straight
   * lines; higher values bend further. Negative values bend to the opposite
   * side. Arcs are computed as a quadratic Bézier in lng/lat space; the
   * destination longitude is unwrapped relative to the origin so that arcs
   * cross the antimeridian via the shorter great-circle direction. (default: 0.2)
   */
  curvature?: number
  /** Number of samples used to render each curve. Higher = smoother. (default: 64) */
  samples?: number
  /**
   * MapLibre paint properties for the arc layer. Merged on top of sensible
   * defaults (`line-color: var(--chart-1)`, `line-width: 2`, `line-opacity: 0.85`).
   * Any value can be a MapLibre expression for per-feature styling, every
   * field on each arc datum (besides `from`/`to`) is exposed via `["get", ...]`.
   */
  paint?: MapArcLinePaint
  /** MapLibre layout properties for the arc layer. Defaults to rounded joins/caps. */
  layout?: MapArcLineLayout
  /**
   * Paint properties applied to the arc currently under the cursor. Each key
   * is merged into `paint` as a `case` expression keyed on per-feature hover
   * state, so only the hovered arc changes appearance.
   */
  hoverPaint?: MapArcLinePaint
  /** Callback when an arc is clicked. */
  onClick?: (e: MapArcEvent<T>) => void
  /**
   * Callback fired when the hovered arc changes. Receives the cursor's
   * lng/lat at the moment of entry, and `null` when the cursor leaves the
   * last hovered arc.
   */
  onHover?: (e: MapArcEvent<T> | null) => void
  /** Whether arcs respond to mouse events (default: true). */
  interactive?: boolean
  /** Optional MapLibre layer id to insert the arc layers before (z-order control). */
  beforeId?: string
}

const DEFAULT_ARC_CURVATURE = 0.2
const DEFAULT_ARC_SAMPLES = 64
const ARC_HIT_MIN_WIDTH = 12
const ARC_HIT_PADDING = 6

const DEFAULT_ARC_PAINT: MapArcLinePaint = {
  "line-color": "var(--chart-1)",
  "line-width": 2,
  "line-opacity": 0.85,
}

const DEFAULT_ARC_LAYOUT: MapArcLineLayout = {
  "line-join": "round",
  "line-cap": "round",
}

function buildArcCoordinates(
  from: [number, number],
  to: [number, number],
  curvature: number,
  samples: number
): [number, number][] {
  const [x0, y0] = from
  const [xTo, y2] = to
  // Unwrap the destination longitude so |dx| <= 180. This makes arcs that
  // straddle the antimeridian (e.g. Tokyo -> San Francisco) bow the short way
  // across the Pacific instead of the long way around the globe. Resulting
  // longitudes may fall outside [-180, 180]; MapLibre renders them correctly
  // on the globe projection, and on mercator when world copies are enabled.
  const rawDx = xTo - x0
  const x2 = rawDx > 180 ? xTo - 360 : rawDx < -180 ? xTo + 360 : xTo
  const dx = x2 - x0
  const dy = y2 - y0
  const distance = Math.hypot(dx, dy)

  if (distance === 0 || curvature === 0) return [from, [x2, y2]]

  const mx = (x0 + x2) / 2
  const my = (y0 + y2) / 2
  const nx = -dy / distance
  const ny = dx / distance
  const offset = distance * curvature
  const cx = mx + nx * offset
  const cy = my + ny * offset

  const points: [number, number][] = []
  const segments = Math.max(2, Math.floor(samples))
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const inv = 1 - t
    const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2
    const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y2
    points.push([x, y])
  }
  return points
}

function MapArc<T extends MapArcDatum = MapArcDatum>({
  data,
  id: propId,
  curvature = DEFAULT_ARC_CURVATURE,
  samples = DEFAULT_ARC_SAMPLES,
  paint,
  layout,
  hoverPaint,
  onClick,
  onHover,
  interactive = true,
  beforeId,
}: MapArcProps<T>) {
  const { map, isLoaded, resolveColor } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `arc-source-${id}`
  const layerId = `arc-layer-${id}`
  const hitLayerId = `arc-hit-layer-${id}`

  const mergedPaint = useMemo(
    () =>
      resolvePaint(
        mergeHoverPaint({ ...DEFAULT_ARC_PAINT, ...paint }, hoverPaint),
        resolveColor
      ),
    [paint, hoverPaint, resolveColor]
  )
  const mergedLayout = useMemo(
    () => ({ ...DEFAULT_ARC_LAYOUT, ...layout }),
    [layout]
  )

  const hitWidth = useMemo(() => {
    const w = paint?.["line-width"] ?? DEFAULT_ARC_PAINT["line-width"]
    const base = typeof w === "number" ? w : ARC_HIT_MIN_WIDTH
    return Math.max(base + ARC_HIT_PADDING, ARC_HIT_MIN_WIDTH)
  }, [paint])

  const geoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
    () => ({
      type: "FeatureCollection",
      features: data.map((arc) => {
        const { from, to, ...properties } = arc
        return {
          type: "Feature",
          properties,
          geometry: {
            type: "LineString",
            coordinates: buildArcCoordinates(from, to, curvature, samples),
          },
        }
      }),
    }),
    [data, curvature, samples]
  )

  const latestRef = useLatest({ data, onClick, onHover })

  // Add source and layers on mount.
  useEffect(() => {
    if (!isLoaded || !map) return

    map.addSource(sourceId, {
      type: "geojson",
      data: geoJSON,
      promoteId: "id",
    })

    map.addLayer(
      {
        id: hitLayerId,
        type: "line",
        source: sourceId,
        layout: DEFAULT_ARC_LAYOUT,
        paint: {
          "line-color": "rgba(0, 0, 0, 0)",
          "line-width": hitWidth,
          "line-opacity": 1,
        },
      },
      beforeId
    )

    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: mergedLayout,
        paint: mergedPaint,
      },
      beforeId
    )

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Sync features when data / curvature / samples change.
  useEffect(() => {
    if (!isLoaded || !map) return
    const source = map.getSource(sourceId) as
      MapLibreGL.GeoJSONSource | undefined
    source?.setData(geoJSON)
  }, [isLoaded, map, geoJSON, sourceId])

  // Sync paint/layout when they change.
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return
    for (const [key, value] of Object.entries(mergedPaint)) {
      map.setPaintProperty(
        layerId,
        key as keyof MapArcLinePaint,
        value as never
      )
    }
    for (const [key, value] of Object.entries(mergedLayout)) {
      map.setLayoutProperty(
        layerId,
        key as keyof MapArcLineLayout,
        value as never
      )
    }
    if (map.getLayer(hitLayerId)) {
      map.setPaintProperty(hitLayerId, "line-width", hitWidth)
    }
  }, [isLoaded, map, layerId, hitLayerId, mergedPaint, mergedLayout, hitWidth])

  // Interaction handlers
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return

    let hoveredId: string | number | null = null

    const setHover = (next: string | number | null) => {
      if (next === hoveredId) return
      const sourceExists = !!map.getSource(sourceId)
      if (hoveredId != null && sourceExists) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false }
        )
      }
      hoveredId = next
      if (next != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: next }, { hover: true })
      }
    }

    const findArc = (featureId: string | number | undefined) =>
      featureId == null
        ? undefined
        : latestRef.current.data.find(
            (arc) => String(arc.id) === String(featureId)
          )

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const featureId = e.features?.[0]?.id as string | number | undefined
      if (featureId == null || featureId === hoveredId) return

      setHover(featureId)
      map.getCanvas().style.cursor = "pointer"

      const arc = findArc(featureId)
      if (arc) {
        latestRef.current.onHover?.({
          arc: arc as T,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          originalEvent: e,
        })
      }
    }

    const handleMouseLeave = () => {
      setHover(null)
      map.getCanvas().style.cursor = ""
      latestRef.current.onHover?.(null)
    }

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const arc = findArc(e.features?.[0]?.id as string | number | undefined)
      if (!arc) return
      latestRef.current.onClick?.({
        arc: arc as T,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      })
    }

    map.on("mousemove", hitLayerId, handleMouseMove)
    map.on("mouseleave", hitLayerId, handleMouseLeave)
    map.on("click", hitLayerId, handleClick)

    return () => {
      map.off("mousemove", hitLayerId, handleMouseMove)
      map.off("mouseleave", hitLayerId, handleMouseLeave)
      map.off("click", hitLayerId, handleClick)
      setHover(null)
      map.getCanvas().style.cursor = ""
    }
  }, [isLoaded, map, hitLayerId, sourceId, interactive, latestRef])

  return null
}

type MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON FeatureCollection data or URL to fetch GeoJSON from */
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number
  /**
   * Colors for cluster circles: [small, medium, large] based on point count.
   * CSS colors or `var(--token)` (default: all `var(--primary)`)
   */
  clusterColors?: [string, string, string]
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number]
  /** Cluster count text color (default: "var(--primary-foreground)") */
  clusterTextColor?: string
  /**
   * Font stack for the cluster count. Defaults to a bold font found in the
   * basemap style, so glyphs always exist on its glyph server.
   */
  clusterTextFont?: string[]
  /** Color for unclustered individual points (default: "var(--primary)") */
  pointColor?: string
  /** Ring around clusters and points (default: "var(--background)") */
  strokeColor?: string
  /** Callback when an unclustered point is clicked */
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number]
  ) => void
  /** Callback when a cluster is clicked. If not provided, zooms into the cluster */
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void
}

const DEFAULT_CLUSTER_COLORS: [string, string, string] = [
  "var(--primary)",
  "var(--primary)",
  "var(--primary)",
]
const DEFAULT_CLUSTER_THRESHOLDS: [number, number] = [100, 750]

/** A text-font stack the current style already uses, preferring bold. */
function findStyleFont(map: MapLibreGL.Map): string[] | undefined {
  const fonts: string[][] = []
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== "symbol") continue
    const font = layer.layout?.["text-font"]
    if (
      Array.isArray(font) &&
      font.every((entry) => typeof entry === "string")
    ) {
      fonts.push(font as string[])
    }
  }
  return fonts.find((font) => font.some((f) => /bold/i.test(f))) ?? fonts[0]
}

function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = DEFAULT_CLUSTER_COLORS,
  clusterThresholds = DEFAULT_CLUSTER_THRESHOLDS,
  clusterTextColor = "var(--primary-foreground)",
  clusterTextFont,
  pointColor = "var(--primary)",
  strokeColor = "var(--background)",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<P>) {
  const { map, isLoaded, reducedMotion, resolveColor } = useMap()
  const id = useId()
  const sourceId = `cluster-source-${id}`
  const clusterLayerId = `clusters-${id}`
  const clusterCountLayerId = `cluster-count-${id}`
  const unclusteredLayerId = `unclustered-point-${id}`

  const [small, medium, large] = clusterColors
  const [mediumAt, largeAt] = clusterThresholds
  const paint = useMemo(() => {
    const colors = [small, medium, large].map(resolveColor)
    return {
      clusterColor: [
        "step",
        ["get", "point_count"],
        colors[0],
        mediumAt,
        colors[1],
        largeAt,
        colors[2],
      ] as MapLibreGL.ExpressionSpecification,
      clusterRadius: [
        "step",
        ["get", "point_count"],
        20,
        mediumAt,
        30,
        largeAt,
        40,
      ] as MapLibreGL.ExpressionSpecification,
      text: resolveColor(clusterTextColor),
      point: resolveColor(pointColor),
      stroke: resolveColor(strokeColor),
    }
  }, [
    small,
    medium,
    large,
    mediumAt,
    largeAt,
    clusterTextColor,
    pointColor,
    strokeColor,
    resolveColor,
  ])
  const paintRef = useLatest(paint)
  const fontRef = useLatest(clusterTextFont)

  // Add source and layers on mount
  useEffect(() => {
    if (!isLoaded || !map) return
    const initial = paintRef.current

    // Add clustered GeoJSON source
    map.addSource(sourceId, {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    })

    // Add cluster circles layer
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": initial.clusterColor,
        "circle-radius": initial.clusterRadius,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": initial.stroke,
        "circle-opacity": 0.9,
      },
    })

    // Add cluster count text layer
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": fontRef.current ??
          findStyleFont(map) ?? ["Noto Sans Bold"],
        "text-size": 12,
      },
      paint: {
        "text-color": initial.text,
      },
    })

    // Add unclustered point layer
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": initial.point,
        "circle-radius": 5,
        "circle-stroke-width": 2,
        "circle-stroke-color": initial.stroke,
      },
    })

    return () => {
      try {
        if (map.getLayer(clusterCountLayerId))
          map.removeLayer(clusterCountLayerId)
        if (map.getLayer(unclusteredLayerId))
          map.removeLayer(unclusteredLayerId)
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, sourceId])

  // Update source data when data prop changes (only for non-URL data)
  useEffect(() => {
    if (!isLoaded || !map || typeof data === "string") return

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
    if (source) {
      source.setData(data)
    }
  }, [isLoaded, map, data, sourceId])

  // Update layer paint when colors, thresholds or the theme change
  useEffect(() => {
    if (!isLoaded || !map) return

    if (map.getLayer(clusterLayerId)) {
      map.setPaintProperty(clusterLayerId, "circle-color", paint.clusterColor)
      map.setPaintProperty(clusterLayerId, "circle-radius", paint.clusterRadius)
      map.setPaintProperty(clusterLayerId, "circle-stroke-color", paint.stroke)
    }
    if (map.getLayer(clusterCountLayerId)) {
      map.setPaintProperty(clusterCountLayerId, "text-color", paint.text)
    }
    if (map.getLayer(unclusteredLayerId)) {
      map.setPaintProperty(unclusteredLayerId, "circle-color", paint.point)
      map.setPaintProperty(
        unclusteredLayerId,
        "circle-stroke-color",
        paint.stroke
      )
    }
  }, [
    isLoaded,
    map,
    clusterLayerId,
    clusterCountLayerId,
    unclusteredLayerId,
    paint,
  ])

  // Handle click events
  useEffect(() => {
    if (!isLoaded || !map) return

    // Cluster click handler - zoom into cluster
    const handleClusterClick = async (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[]
      }
    ) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId],
      })
      if (!features.length) return

      const feature = features[0]
      const clusterId = feature.properties?.cluster_id as number
      const pointCount = feature.properties?.point_count as number
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ]

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount)
      } else {
        // Default behavior: zoom to cluster expansion zoom
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource
        const zoom = await source.getClusterExpansionZoom(clusterId)
        map.easeTo({
          center: coordinates,
          zoom,
          duration: reducedMotion ? 0 : CAMERA_DURATION,
        })
      }
    }

    // Unclustered point click handler
    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[]
      }
    ) => {
      if (!onPointClick || !e.features?.length) return

      const feature = e.features[0]
      const coordinates = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number]

      // Handle world copies
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      onPointClick(
        feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
        coordinates
      )
    }

    // Cursor style handlers
    const handleMouseEnterCluster = () => {
      map.getCanvas().style.cursor = "pointer"
    }
    const handleMouseLeaveCluster = () => {
      map.getCanvas().style.cursor = ""
    }
    const handleMouseEnterPoint = () => {
      if (onPointClick) {
        map.getCanvas().style.cursor = "pointer"
      }
    }
    const handleMouseLeavePoint = () => {
      map.getCanvas().style.cursor = ""
    }

    map.on("click", clusterLayerId, handleClusterClick)
    map.on("click", unclusteredLayerId, handlePointClick)
    map.on("mouseenter", clusterLayerId, handleMouseEnterCluster)
    map.on("mouseleave", clusterLayerId, handleMouseLeaveCluster)
    map.on("mouseenter", unclusteredLayerId, handleMouseEnterPoint)
    map.on("mouseleave", unclusteredLayerId, handleMouseLeavePoint)

    return () => {
      map.off("click", clusterLayerId, handleClusterClick)
      map.off("click", unclusteredLayerId, handlePointClick)
      map.off("mouseenter", clusterLayerId, handleMouseEnterCluster)
      map.off("mouseleave", clusterLayerId, handleMouseLeaveCluster)
      map.off("mouseenter", unclusteredLayerId, handleMouseEnterPoint)
      map.off("mouseleave", unclusteredLayerId, handleMouseLeavePoint)
    }
  }, [
    isLoaded,
    map,
    clusterLayerId,
    unclusteredLayerId,
    sourceId,
    onClusterClick,
    onPointClick,
    reducedMotion,
  ])

  return null
}

export {
  Map,
  useMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapControls,
  MapRoute,
  RouteProgress,
  RouteMarker,
  MapArc,
  MapGeoJSON,
  MapClusterLayer,
}

export type {
  MapRef,
  MapViewport,
  MapStyleOption,
  MapArcDatum,
  MapArcEvent,
  MapGeoJSONData,
  MapGeoJSONFeature,
  MapGeoJSONEvent,
  MapProps,
  MapMarkerProps,
  MarkerContentProps,
  MarkerPopupProps,
  MarkerTooltipProps,
  MarkerLabelProps,
  MapControlsProps,
  MapPopupProps,
  MapRouteProps,
  RouteProgressProps,
  RouteMarkerProps,
  RouteAnchor,
  MapArcProps,
  MapGeoJSONProps,
  MapClusterLayerProps,
}
