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
  ["Background", "bg-background", "Page background"],
  ["Card", "bg-card", "Raised surface"],
  ["Primary", "bg-primary", "Primary action"],
  ["Accent", "bg-accent", "Hover and pressed"],
  ["Ring", "bg-ring", "Focus ring"],
  ["Moss", "bg-moss", "Success"],
  ["Rust", "bg-rust", "Danger"],
  ["Muted", "bg-muted", "Muted surface"],
] as const

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:gap-16 sm:py-16">
      <section className="grid items-end gap-8 md:grid-cols-[1.4fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">Personal registry</p>
          <h1 className="max-w-xl text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
            A shadcn registry.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Radix primitives, this palette, and a few extra components. Dark is
            the default. Light is the paper theme. Install them with the CLI.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button asChild variant="lantern">
              <Link href="/kitchen">Runs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/motion">Motion</Link>
            </Button>
          </div>
        </div>
        <ForestCard>
          <CardHeader>
            <CardTitle>North Cabin</CardTitle>
            <CardDescription>
              Dark is the default. Light is the paper theme.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>Fraunces on headings. Figtree on UI text.</p>
            <p>The focus ring uses the ring token.</p>
            <p>Motion stays under 220ms.</p>
          </CardContent>
        </ForestCard>
      </section>

      <section className="grid gap-4">
        <h2 className="text-3xl">Palette</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map(([name, tone, note]) => (
            <div
              key={name}
              className="overflow-hidden rounded-xl border border-border"
            >
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
          <p className="font-serif text-4xl leading-none sm:text-5xl">
            Fraunces
          </p>
          <p className="mt-3 max-w-sm text-muted-foreground">Used for h1–h3.</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Interface</p>
          <p className="font-sans text-4xl leading-none sm:text-5xl">Figtree</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Used for labels, buttons, and body text.
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
