"use client"

import * as React from "react"
import { MapPinIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Map,
  MapClusterLayer,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useMap,
  type MapRef,
} from "@/components/ui/map"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ToggleGroup, ToggleGroupItem } from "@/registry/ravenwood/toggle-group"

import {
  allZones,
  deliveryZones,
  kitchen,
  listings,
  stores,
  storesGeoJSON,
  venues,
  zoneCopy,
  zoneFeature,
  type DeliveryZone,
  type Store,
} from "./map-fixtures"

const frame = "h-[360px] overflow-hidden rounded-xl border border-border"

function PlainDemo() {
  return (
    <div className={frame}>
      <Map aria-label="Map of Chicago" center={[-87.6298, 41.8781]} zoom={11}>
        <MapControls showZoom showCompass showFullscreen showScale />
      </Map>
    </div>
  )
}

/** Reports which stores sit inside the current view. */
function VisibleStores({ onChange }: { onChange: (ids: Store[]) => void }) {
  const { map, isLoaded } = useMap()
  React.useEffect(() => {
    if (!map || !isLoaded) return
    const update = () => {
      const bounds = map.getBounds()
      const center = map.getCenter()
      // Prefer city variety over pure distance: store ids cycle metros, so
      // sorting by id keeps Chicago/Milwaukee/… interleaved in the sidebar.
      const inView = stores
        .filter((store) => bounds.contains([store.longitude, store.latitude]))
        .sort((a, b) => {
          const ai = Number(a.id.replace("store-", ""))
          const bi = Number(b.id.replace("store-", ""))
          if (ai !== bi) return ai - bi
          return (
            Math.hypot(a.longitude - center.lng, a.latitude - center.lat) -
            Math.hypot(b.longitude - center.lng, b.latitude - center.lat)
          )
        })
      onChange(inView)
    }
    update()
    map.on("moveend", update)
    return () => {
      map.off("moveend", update)
    }
  }, [map, isLoaded, onChange])
  return null
}

const storesById = Object.fromEntries(stores.map((store) => [store.id, store]))

function StoreLocatorDemo() {
  const mapRef = React.useRef<MapRef>(null)
  const [inView, setInView] = React.useState<Store[]>([])
  const [selected, setSelected] = React.useState<Store | null>(null)
  const reduce = useReducedMotion()

  const focusStore = (store: Store) => {
    setSelected(store)
    mapRef.current?.easeTo({
      center: [store.longitude, store.latitude],
      zoom: 13,
      duration: reduce ? 0 : 220,
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
      <div className={cn(frame, "h-[420px]")}>
        <Map
          ref={mapRef}
          aria-label="Store locator"
          center={[-90.5, 38.8]}
          zoom={3.6}
        >
          <VisibleStores onChange={setInView} />
          <MapClusterLayer
            data={storesGeoJSON}
            onPointClick={(feature) => {
              const store = storesById[feature.properties.id]
              if (store) setSelected(store)
            }}
          />
          <MapControls showZoom showScale={{ unit: "imperial" }} />
          {selected && (
            <MapPopup
              key={selected.id}
              longitude={selected.longitude}
              latitude={selected.latitude}
              aria-label={selected.name}
              onClose={() => setSelected(null)}
            >
              <p className="font-medium">{selected.name}</p>
              <p className="mt-1 text-muted-foreground">{selected.address}</p>
              <p className="mt-1 text-muted-foreground">{selected.hours}</p>
            </MapPopup>
          )}
        </Map>
      </div>
      <section aria-label="Stores in view" className="flex min-h-0 flex-col">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {inView.length} of {stores.length} stores in view
        </p>
        <ul className="mt-2 grid max-h-[392px] gap-1 overflow-y-auto pr-1">
          {inView.slice(0, 20).map((store) => (
            <li key={store.id}>
              <button
                type="button"
                onClick={() => focusStore(store)}
                aria-current={selected?.id === store.id || undefined}
                className="duration-snap w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current]:border-border aria-[current]:bg-muted"
              >
                <span className="block font-medium">{store.name}</span>
                <span className="block text-muted-foreground">
                  {store.address}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

const price = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const shortPrice = (value: number) => `$${Math.round(value / 1000)}k`

function ListingsDemo() {
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [openId, setOpenId] = React.useState<string | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Listings">
        {listings.map((listing) => (
          <li
            key={listing.id}
            onMouseEnter={() => setHovered(listing.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(listing.id)}
            onBlur={() => setHovered(null)}
            className={cn(
              "duration-snap rounded-xl border bg-card p-3 transition-colors",
              hovered === listing.id || openId === listing.id
                ? "border-ring"
                : "border-border"
            )}
          >
            <p className="font-serif text-lg">{price.format(listing.price)}</p>
            <p className="text-sm">{listing.title}</p>
            <p className="text-sm text-muted-foreground">
              {listing.neighborhood} · {listing.beds} bd · {listing.baths} ba ·{" "}
              {listing.sqft.toLocaleString()} sqft
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto px-0"
              onClick={() => setOpenId(listing.id)}
            >
              <MapPinIcon />
              Show on map
            </Button>
          </li>
        ))}
      </ul>
      <div className={cn(frame, "h-[420px] lg:h-auto lg:min-h-[420px]")}>
        <Map aria-label="Listings map" center={[-87.66, 41.89]} zoom={10.4}>
          {listings.map((listing) => {
            const active = hovered === listing.id || openId === listing.id
            return (
              <MapMarker
                key={listing.id}
                longitude={listing.longitude}
                latitude={listing.latitude}
                label={`${listing.title}, ${price.format(listing.price)}`}
                open={openId === listing.id}
                onOpenChange={(open) =>
                  setOpenId((current) =>
                    open ? listing.id : current === listing.id ? null : current
                  )
                }
                onMouseEnter={() => setHovered(listing.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <MarkerContent>
                  <span
                    className={cn(
                      "duration-snap block rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-popover text-popover-foreground"
                    )}
                  >
                    {shortPrice(listing.price)}
                  </span>
                </MarkerContent>
                <MarkerPopup>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-muted-foreground">
                    {listing.neighborhood}, {price.format(listing.price)}
                  </p>
                </MarkerPopup>
              </MapMarker>
            )
          })}
          <MapControls showZoom />
        </Map>
      </div>
    </div>
  )
}

function VenueDemo() {
  const [chosen, setChosen] = React.useState<string | null>(null)
  const chosenVenue = venues.find((venue) => venue.id === chosen)

  return (
    <div className="grid gap-3">
      <div className={frame}>
        <Map aria-label="Venues" center={[-87.638, 41.894]} zoom={12}>
          {venues.map((venue) => (
            <MapMarker
              key={venue.id}
              longitude={venue.longitude}
              latitude={venue.latitude}
              label={`${venue.name}, ${venue.kind}, ${venue.capacity} guests`}
            >
              <MarkerContent>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-background shadow-sm",
                    chosen === venue.id
                      ? "bg-lantern text-lantern-foreground ring-2 ring-ring"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <MapPinIcon className="size-4" />
                </span>
                <MarkerLabel position="bottom">{venue.name}</MarkerLabel>
              </MarkerContent>
              <MarkerPopup>
                <p className="font-medium">{venue.name}</p>
                <p className="text-muted-foreground">
                  {venue.kind}, up to {venue.capacity} guests
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  variant={chosen === venue.id ? "secondary" : "default"}
                  onClick={() => setChosen(venue.id)}
                >
                  {chosen === venue.id ? "Chosen" : "Choose venue"}
                </Button>
              </MarkerPopup>
            </MapMarker>
          ))}
          <MapControls showZoom />
        </Map>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {chosenVenue
          ? `Venue: ${chosenVenue.name} (${chosenVenue.capacity} guests)`
          : "No venue chosen yet. Open a pin to choose one."}
      </p>
    </div>
  )
}

function DeliveryDemo() {
  const [zone, setZone] = React.useState<DeliveryZone>(30)
  const selectedZone = React.useMemo(() => zoneFeature(zone), [zone])

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={String(zone)}
          onValueChange={(value) => {
            if (value) setZone(Number(value) as DeliveryZone)
          }}
          aria-label="Delivery time"
        >
          {deliveryZones.map((minutes) => (
            <ToggleGroupItem key={minutes} value={String(minutes)}>
              {minutes} min
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {zone} min zone: {zoneCopy[zone]}
        </p>
      </div>
      <div className={frame}>
        <Map
          aria-label="Delivery zones"
          center={[kitchen.longitude - 0.02, kitchen.latitude]}
          zoom={10.6}
        >
          <MapGeoJSON
            id="zones-outline"
            data={allZones}
            fillPaint={false}
            linePaint={{
              "line-color": "var(--muted-foreground)",
              "line-width": 1,
              "line-dasharray": [2, 2],
            }}
          />
          <MapGeoJSON
            id="zone-selected"
            data={selectedZone}
            fillPaint={{ "fill-color": "var(--chart-1)", "fill-opacity": 0.22 }}
            linePaint={{ "line-color": "var(--chart-1)", "line-width": 2 }}
          />
          <MapMarker
            longitude={kitchen.longitude}
            latitude={kitchen.latitude}
            label={kitchen.name}
          >
            <MarkerContent />
          </MapMarker>
          <MapControls showZoom showScale={{ unit: "imperial" }} />
        </Map>
      </div>
    </div>
  )
}

function MapDemo({ example = "plain" }: { example?: string }) {
  switch (example) {
    case "store-locator":
      return <StoreLocatorDemo />
    case "listings":
      return <ListingsDemo />
    case "venues":
      return <VenueDemo />
    case "delivery":
      return <DeliveryDemo />
    default:
      return <PlainDemo />
  }
}

export { MapDemo }
export default MapDemo
