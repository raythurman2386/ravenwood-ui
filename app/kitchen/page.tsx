import type { Metadata } from "next"

import { LodgeConsole } from "@/components/kitchen/lodge-console"

export const metadata: Metadata = {
  title: "Runs",
  description: "A runs desk built from Ravenwood UI.",
}

export default function KitchenPage() {
  return <LodgeConsole />
}
