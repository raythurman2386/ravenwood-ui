import type { Metadata } from "next"
import Link from "next/link"

import { catalog, catalogGroups } from "@/lib/catalog"

export const metadata: Metadata = {
  title: "Docs",
  description: "Ravenwood UI components, variants, and install snippets.",
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Components</h1>
        <p className="mt-3 text-muted-foreground">
          Each page shows the component, the install command, and a usage
          snippet.
        </p>
      </div>
      {catalogGroups.map((group) => (
        <section key={group} className="grid gap-3">
          <h2 className="text-2xl">{group}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog
              .filter((item) => item.group === group)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/docs/${item.slug}`}
                    className="duration-fade block h-full min-h-16 rounded-xl border border-border bg-card px-4 py-3 transition-colors ease-enter hover:border-ring/50"
                  >
                    <p className="font-serif text-lg">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
