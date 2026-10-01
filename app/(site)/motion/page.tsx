import type { Metadata } from "next"

import { MotionPlayground } from "@/components/site/motion-playground"
import { easing, intents, motionBan } from "@/lib/motion"

export const metadata: Metadata = {
  title: "Motion",
  description:
    "Ravenwood motion language. Named intents, the ban list, and a live playground.",
}

export default function MotionPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-sm tracking-[0.18em] text-muted-foreground uppercase">
          Design system
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Motion</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Motion communicates. It does not decorate. If you cannot say what
          information an animation carries — press confirmation, spatial origin,
          hierarchy, continuity — delete it.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-2xl">Named intents</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Enter on{" "}
          <code className="font-mono text-xs">{easing.enter}</code>. Exit on{" "}
          <code className="font-mono text-xs">{easing.exit}</code>, and slightly
          faster than enter. Springs live in <code className="font-mono text-xs">lib/motion.ts</code>.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Intent</th>
                <th className="px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium">Use</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent) => (
                <tr key={intent.name} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-xs">{intent.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{intent.ms}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {intent.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">On the controls</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Press, origin, hierarchy, continuity. The UI should feel good. The
          animation should be almost invisible.
        </p>
        <MotionPlayground />
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">Ban list</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {motionBan.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
