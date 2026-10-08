/**
 * Made-up data for the map docs. Site-only: not part of the registry item.
 * Every name, address, and price here is fictional.
 */

import type * as GeoJSON from "geojson"

export type Store = {
  id: string
  name: string
  city: string
  address: string
  hours: string
  longitude: number
  latitude: number
}

// Small seeded PRNG so the 300 stores are the same on every render.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const metros: Array<[city: string, longitude: number, latitude: number]> = [
  ["Chicago", -87.6298, 41.8781],
  ["Milwaukee", -87.9065, 43.0389],
  ["Minneapolis", -93.265, 44.9778],
  ["St. Louis", -90.1994, 38.627],
  ["Kansas City", -94.5786, 39.0997],
  ["Indianapolis", -86.1581, 39.7684],
  ["Detroit", -83.0458, 42.3314],
  ["Columbus", -82.9988, 39.9612],
  ["Nashville", -86.7816, 36.1627],
  ["Dallas", -96.797, 32.7767],
  ["Austin", -97.7431, 30.2672],
  ["Denver", -104.9903, 39.7392],
  ["Atlanta", -84.388, 33.749],
  ["Pittsburgh", -79.9959, 40.4406],
  ["Omaha", -95.9345, 41.2565],
]

const streets = [
  "Oak",
  "Cedar",
  "Maple",
  "Birch",
  "Hollow",
  "Lantern",
  "Fern",
  "Willow",
  "Ash",
  "Juniper",
]
const kinds = ["St", "Ave", "Rd", "Ln", "Blvd"]
const hours = ["7am to 9pm", "8am to 8pm", "6am to 10pm", "9am to 7pm"]

function buildStores(): Store[] {
  const random = mulberry32(2386)
  const stores: Store[] = []
  for (let i = 0; i < 300; i++) {
    const [city, longitude, latitude] = metros[i % metros.length]
    // Spread stores out to about 25km from the metro center.
    const angle = random() * Math.PI * 2
    const distance = Math.sqrt(random()) * 0.22
    const number = 100 + Math.floor(random() * 8900)
    const street = streets[Math.floor(random() * streets.length)]
    const kind = kinds[Math.floor(random() * kinds.length)]
    stores.push({
      id: `store-${i + 1}`,
      name: `Hearth & Field #${i + 1}`,
      city,
      address: `${number} ${street} ${kind}, ${city}`,
      hours: hours[i % hours.length],
      longitude: longitude + (Math.cos(angle) * distance) / 0.75,
      latitude: latitude + Math.sin(angle) * distance,
    })
  }
  return stores
}

export const stores = buildStores()

export const storesGeoJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  { id: string }
> = {
  type: "FeatureCollection",
  features: stores.map((store) => ({
    type: "Feature",
    properties: { id: store.id },
    geometry: {
      type: "Point",
      coordinates: [store.longitude, store.latitude],
    },
  })),
}

export type Listing = {
  id: string
  title: string
  neighborhood: string
  price: number
  beds: number
  baths: number
  sqft: number
  longitude: number
  latitude: number
}

export const listings: Listing[] = [
  {
    id: "l1",
    title: "Greystone two-flat",
    neighborhood: "Logan Square",
    price: 685000,
    beds: 4,
    baths: 2,
    sqft: 2400,
    longitude: -87.7083,
    latitude: 41.9231,
  },
  {
    id: "l2",
    title: "Corner condo with porch",
    neighborhood: "Andersonville",
    price: 389000,
    beds: 2,
    baths: 2,
    sqft: 1150,
    longitude: -87.6687,
    latitude: 41.9796,
  },
  {
    id: "l3",
    title: "Brick workers cottage",
    neighborhood: "Pilsen",
    price: 455000,
    beds: 3,
    baths: 1,
    sqft: 1300,
    longitude: -87.6566,
    latitude: 41.8565,
  },
  {
    id: "l4",
    title: "Loft above the bakery",
    neighborhood: "West Loop",
    price: 529000,
    beds: 2,
    baths: 2,
    sqft: 1400,
    longitude: -87.6512,
    latitude: 41.8837,
  },
  {
    id: "l5",
    title: "Frame house with garden",
    neighborhood: "Ravenswood",
    price: 799000,
    beds: 4,
    baths: 3,
    sqft: 2650,
    longitude: -87.6744,
    latitude: 41.9667,
  },
  {
    id: "l6",
    title: "Courtyard one-bed",
    neighborhood: "Hyde Park",
    price: 239000,
    beds: 1,
    baths: 1,
    sqft: 780,
    longitude: -87.5917,
    latitude: 41.7943,
  },
]

export type Venue = {
  id: string
  name: string
  kind: string
  capacity: number
  longitude: number
  latitude: number
}

export const venues: Venue[] = [
  {
    id: "v1",
    name: "The Lantern Room",
    kind: "Rooftop",
    capacity: 120,
    longitude: -87.6268,
    latitude: 41.8885,
  },
  {
    id: "v2",
    name: "Hollow Oak Hall",
    kind: "Ballroom",
    capacity: 300,
    longitude: -87.6448,
    latitude: 41.8786,
  },
  {
    id: "v3",
    name: "Fernhouse",
    kind: "Greenhouse",
    capacity: 80,
    longitude: -87.6334,
    latitude: 41.9205,
  },
  {
    id: "v4",
    name: "Canopy Works",
    kind: "Warehouse",
    capacity: 450,
    longitude: -87.6603,
    latitude: 41.8995,
  },
  {
    id: "v5",
    name: "Brass & Birch",
    kind: "Supper club",
    capacity: 60,
    longitude: -87.6167,
    latitude: 41.8689,
  },
]

export const kitchen = {
  name: "Hearth & Field kitchen",
  longitude: -87.6553,
  latitude: 41.9097,
}

export const deliveryZones = [15, 30, 45] as const
export type DeliveryZone = (typeof deliveryZones)[number]

const zoneRadiusKm: Record<DeliveryZone, number> = { 15: 2.5, 30: 5, 45: 8 }

/** A rough circle around the kitchen. Good enough for a delivery preview. */
function ring(radiusKm: number, steps = 64): [number, number][] {
  const latRadius = radiusKm / 110.574
  const lngRadius =
    radiusKm / (111.32 * Math.cos((kitchen.latitude * Math.PI) / 180))
  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    // Squash east-west a little: the lake cuts off the east side.
    const east = Math.cos(angle) > 0 ? 0.55 : 1
    points.push([
      kitchen.longitude + Math.cos(angle) * lngRadius * east,
      kitchen.latitude + Math.sin(angle) * latRadius,
    ])
  }
  return points
}

export function zoneFeature(
  minutes: DeliveryZone
): GeoJSON.Feature<GeoJSON.Polygon, { minutes: number }> {
  return {
    type: "Feature",
    properties: { minutes },
    geometry: { type: "Polygon", coordinates: [ring(zoneRadiusKm[minutes])] },
  }
}

export const allZones: GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  { minutes: number }
> = {
  type: "FeatureCollection",
  features: deliveryZones.map(zoneFeature),
}

export const zoneCopy: Record<DeliveryZone, string> = {
  15: "Hot food, no fee.",
  30: "Hot food, $3.99 delivery.",
  45: "Pantry orders only, $6.99 delivery.",
}
