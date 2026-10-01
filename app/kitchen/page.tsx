import type { Metadata } from "next"

import { LodgeConsole } from "@/components/kitchen/lodge-console"

export const metadata: Metadata = {
  title: "Lodge desk",
  description: "A North Cabin evening watch built from Ravenwood UI.",
}

export default function KitchenPage() {
  return <LodgeConsole />
}
