import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForestCard } from "@/registry/ravenwood/forest-card"
import { githubRepo, githubUser, registryNamespace } from "@/lib/registry"

const swatches = [
  ["Background", "bg-background", "Bark"],
  ["Card", "bg-card", "Wood panel"],
  ["Primary", "bg-primary", "Canopy"],
  ["Accent", "bg-accent", "Lantern wash"],
  ["Ring", "bg-ring", "Brass"],
  ["Moss", "bg-moss", "Trail"],
  ["Rust", "bg-rust", "Dried blood"],
  ["Muted", "bg-muted", "Shade"],
] as const

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:gap-16 sm:py-16">
      <section className="grid items-end gap-8 md:grid-cols-[1.4fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <p className="text-sm tracking-[0.18em] text-muted-foreground uppercase">
            Personal component source
          </p>
          <h1 className="max-w-xl text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
            Quiet timber, moss, and lantern light.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Ravenwood UI is shadcn/ui on Radix, restyled. The primitives stay
            familiar. The tokens, the type, and a few signature pieces are mine,
            and they install into the next project with the shadcn CLI.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/docs">Read the components</Link>
            </Button>
            <Button asChild variant="lantern">
              <Link href="/kitchen">Sit the lodge desk</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/motion">Motion</Link>
            </Button>
          </div>
        </div>
        <ForestCard>
          <CardHeader>
            <CardTitle>North Cabin</CardTitle>
            <CardDescription>Dark first. Light is the paper mode.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Display is Fraunces. Interface is Figtree.</p>
            <p>Focus rings are lantern brass, not a blue halo.</p>
            <p>Motion is a lantern catching: snap, then rest.</p>
          </CardContent>
        </ForestCard>
      </section>

      <section className="grid gap-4">
        <h2 className="text-3xl">Palette</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map(([name, tone, note]) => (
            <div key={name} className="overflow-hidden rounded-xl border border-border">
              <div className={`h-16 ${tone}`} />
              <div className="px-3 py-2">
                <p className="text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Display</p>
          <p className="font-serif text-4xl leading-none sm:text-5xl">Fraunces</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Optical size and a soft terminal. Headings, card titles, empty states.
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Interface</p>
          <p className="font-sans text-4xl leading-none sm:text-5xl">Figtree</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Geometric, quiet, and readable at 14px in a sidebar.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-3xl">Install into the next repo</h2>
        <Card>
          <CardHeader>
            <CardTitle>Namespace</CardTitle>
            <CardDescription>
              {registryNamespace} reads built items from GitHub. Replace{" "}
              {githubUser} if you publish the repo under another account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
              <code>{`npx shadcn@latest init --template next --base radix --name my-app --yes ${githubUser}/${githubRepo}/index
npx shadcn@latest add ${registryNamespace}/button

# tokens only, on a project that already has shadcn:
npx shadcn@latest add ${githubUser}/${githubRepo}/theme

# one component, with no namespace configured:
npx shadcn@latest add ${githubUser}/${githubRepo}/button`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
