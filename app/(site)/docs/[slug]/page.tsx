import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/site/code-block"
import { Showcase } from "@/components/docs/showcase"
import {
  catalog,
  getCatalogItem,
  githubInstall,
  namespaceInstall,
} from "@/lib/catalog"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = getCatalogItem(slug)
  if (!item) {
    return { title: "Not found" }
  }
  return { title: item.title, description: item.description }
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params
  const item = getCatalogItem(slug)
  if (!item) {
    notFound()
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-muted-foreground">{item.group}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">{item.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {item.description}
        </p>
      </div>
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-border bg-card/60 p-4 sm:p-6">
        <Showcase slug={item.slug} />
      </div>
      <CodeBlock
        label="Install"
        code={`${namespaceInstall(item.slug)}\n${githubInstall(item.slug)}`}
      />
      {item.setup ? <CodeBlock label="Setup" code={item.setup} /> : null}
      <CodeBlock code={item.usage} />
      {item.examples?.length ? (
        <section className="flex flex-col gap-10">
          <h2 className="text-2xl sm:text-3xl">Examples</h2>
          {item.examples.map((example) => (
            <div key={example.id} className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl">{example.title}</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {example.description}
                </p>
              </div>
              <div className="min-w-0 overflow-x-auto rounded-2xl border border-border bg-card/60 p-4 sm:p-6">
                <Showcase slug={item.slug} example={example.id} />
              </div>
              <CodeBlock code={example.usage} />
            </div>
          ))}
        </section>
      ) : null}
    </main>
  )
}
